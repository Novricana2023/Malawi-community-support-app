import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import UploadFile, HTTPException

from app.models.report import Report, ReportAttachment, ReportStatus, UrgencyLevel
from app.models.user import User, UserRole
from app.models.feedback import Feedback
from app.models.activity import ActivityHistory
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse
from app.services.priority import detect_priority, generate_report_number
from app.services.notification_service import create_notification, log_activity
from app.services.email_service import (
    send_report_received_email,
    send_status_update_email,
    send_official_feedback_email,
)
from app.config import settings


def _build_report_response(report: Report) -> dict:
    return {
        "id": report.id,
        "report_number": report.report_number,
        "category": report.category,
        "title": report.title,
        "description": report.description,
        "location": report.location,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "urgency": report.urgency,
        "status": report.status,
        "department_id": report.department_id,
        "department_name": report.department.name if report.department else None,
        "assigned_officer_id": report.assigned_officer_id,
        "assigned_officer_name": report.assigned_officer.full_name if report.assigned_officer else None,
        "resolution_notes": report.resolution_notes,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "resolved_at": report.resolved_at,
        "closed_at": report.closed_at,
        "citizen": report.citizen,
        "attachments": report.attachments,
        "activities": [
            {
                "id": a.id,
                "action": a.action,
                "description": a.description,
                "old_value": a.old_value,
                "new_value": a.new_value,
                "created_at": a.created_at,
                "user_name": a.user.full_name if a.user else "System",
            }
            for a in sorted(report.activities, key=lambda x: x.created_at)
        ],
        "feedback": [
            {
                "id": f.id,
                "message": f.message,
                "is_official": f.is_official,
                "created_at": f.created_at,
                "user_name": f.user.full_name if f.user else "Unknown",
            }
            for f in sorted(report.feedback, key=lambda x: x.created_at)
        ],
    }


def get_report_query(db: Session):
    return db.query(Report).options(
        joinedload(Report.citizen),
        joinedload(Report.department),
        joinedload(Report.assigned_officer),
        joinedload(Report.attachments),
        joinedload(Report.activities).joinedload(ActivityHistory.user),
        joinedload(Report.feedback).joinedload(Feedback.user),
    )


def create_report(db: Session, citizen: User, data: ReportCreate, files: list[UploadFile] | None = None) -> Report:
    count = db.query(Report).count()
    urgency = data.urgency or detect_priority(data.category)

    report = Report(
        report_number=generate_report_number(count),
        citizen_id=citizen.id,
        category=data.category,
        title=data.title,
        description=data.description,
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        urgency=urgency,
        status=ReportStatus.SUBMITTED,
    )
    db.add(report)
    db.flush()

    log_activity(db, report.id, "report_submitted", f"Report {report.report_number} submitted by {citizen.full_name}", citizen.id)

    if files:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        for file in files:
            ext = os.path.splitext(file.filename or "file")[1]
            unique_name = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_name)
            content = file.file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            attachment = ReportAttachment(
                report_id=report.id,
                file_name=file.filename or unique_name,
                file_path=file_path,
                file_type=file.content_type or "application/octet-stream",
            )
            db.add(attachment)

    create_notification(
        db, citizen.id,
        "Report Received",
        f"Your report {report.report_number} has been received.",
        report.id,
    )

    officials = db.query(User).filter(User.role.in_([UserRole.OFFICIAL, UserRole.ADMIN])).all()
    for official in officials:
        create_notification(
            db, official.id,
            "New Community Report",
            f"New {urgency.value} report: {report.title} ({report.report_number})",
            report.id,
        )

    db.commit()
    db.refresh(report)
    result = get_report_query(db).filter(Report.id == report.id).first()
    if result and result.citizen:
        send_report_received_email(result.citizen, result)
    return result


def update_report(db: Session, report_id: int, data: ReportUpdate, user: User) -> Report:
    report = get_report_query(db).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    old_status = report.status.value if report.status else None

    if data.status:
        report.status = data.status
        if data.status == ReportStatus.RESOLVED:
            report.resolved_at = datetime.utcnow()
        elif data.status == ReportStatus.CLOSED:
            report.closed_at = datetime.utcnow()

    if data.department_id is not None:
        report.department_id = data.department_id
    if data.assigned_officer_id is not None:
        report.assigned_officer_id = data.assigned_officer_id
    if data.resolution_notes is not None:
        report.resolution_notes = data.resolution_notes

    report.updated_at = datetime.utcnow()

    if data.status and data.status.value != old_status:
        log_activity(
            db, report.id, "status_changed",
            f"Status changed from {old_status} to {data.status.value}",
            user.id, old_status, data.status.value,
        )
        status_messages = {
            ReportStatus.UNDER_REVIEW: "Your report is now under review.",
            ReportStatus.ASSIGNED: "Your issue has been assigned to a department.",
            ReportStatus.IN_PROGRESS: "Your issue is now being worked on.",
            ReportStatus.RESOLVED: "Your issue has been resolved.",
            ReportStatus.CLOSED: "Your report has been closed.",
        }
        msg = status_messages.get(data.status, f"Status updated to {data.status.value}")
        create_notification(db, report.citizen_id, "Status Update", msg, report.id)

    db.commit()
    result = get_report_query(db).filter(Report.id == report_id).first()
    if result and result.citizen and data.status and data.status.value != old_status:
        send_status_update_email(result.citizen, result, data.status, old_status)
    return result


def add_feedback(db: Session, report_id: int, user: User, message: str, is_official: bool = False) -> Feedback:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    feedback = Feedback(report_id=report_id, user_id=user.id, message=message, is_official=is_official)
    db.add(feedback)
    log_activity(db, report_id, "feedback_added", message, user.id)

    if is_official:
        create_notification(db, report.citizen_id, "Government Feedback", message, report_id)

    db.commit()
    db.refresh(feedback)

    if is_official:
        full_report = get_report_query(db).filter(Report.id == report_id).first()
        if full_report and full_report.citizen:
            send_official_feedback_email(full_report.citizen, full_report, message)

    return feedback
