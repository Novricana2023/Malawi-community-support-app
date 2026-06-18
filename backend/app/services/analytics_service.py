from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.report import Report, ReportStatus, UrgencyLevel, IssueCategory
from app.models.user import User


def get_dashboard_stats(db: Session) -> dict:
    today = datetime.utcnow().date()
    total = db.query(Report).count()
    new_today = db.query(Report).filter(func.date(Report.created_at) == today).count()
    pending = db.query(Report).filter(
        Report.status.in_([ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW, ReportStatus.ASSIGNED, ReportStatus.IN_PROGRESS])
    ).count()
    emergency = db.query(Report).filter(Report.urgency == UrgencyLevel.EMERGENCY, Report.status != ReportStatus.CLOSED).count()
    resolved = db.query(Report).filter(Report.status.in_([ReportStatus.RESOLVED, ReportStatus.CLOSED])).count()

    resolved_reports = db.query(Report).filter(Report.resolved_at.isnot(None)).all()
    avg_days = 0
    if resolved_reports:
        total_days = sum((r.resolved_at - r.created_at).days for r in resolved_reports)
        avg_days = round(total_days / len(resolved_reports), 1)

    return {
        "total_reports": total,
        "new_today": new_today,
        "pending_issues": pending,
        "emergency_cases": emergency,
        "resolved_issues": resolved,
        "avg_resolution_days": avg_days,
    }


def get_issues_by_category(db: Session) -> list[dict]:
    results = db.query(Report.category, func.count(Report.id)).group_by(Report.category).all()
    return [{"category": cat.value.replace("_", " ").title(), "count": count} for cat, count in results]


def get_issues_by_area(db: Session) -> list[dict]:
    results = (
        db.query(User.area_village, func.count(Report.id))
        .join(Report, Report.citizen_id == User.id)
        .filter(User.area_village.isnot(None))
        .group_by(User.area_village)
        .order_by(func.count(Report.id).desc())
        .limit(10)
        .all()
    )
    return [{"area": area or "Unknown", "count": count} for area, count in results]


def get_monthly_trends(db: Session) -> list[dict]:
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    month_expr = func.strftime("%Y-%m", Report.created_at)
    results = (
        db.query(month_expr.label("month"), func.count(Report.id))
        .filter(Report.created_at >= six_months_ago)
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [{"month": month, "count": count} for month, count in results]


def get_resolution_performance(db: Session) -> list[dict]:
    statuses = [ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW, ReportStatus.ASSIGNED,
                ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED, ReportStatus.CLOSED]
    data = []
    for status in statuses:
        count = db.query(Report).filter(Report.status == status).count()
        data.append({"status": status.value.replace("_", " ").title(), "count": count})
    return data


def get_transparency_stats(db: Session) -> dict:
    total = db.query(Report).count()
    resolved = db.query(Report).filter(Report.status.in_([ReportStatus.RESOLVED, ReportStatus.CLOSED])).count()
    in_progress = db.query(Report).filter(Report.status == ReportStatus.IN_PROGRESS).count()
    pending = db.query(Report).filter(
        Report.status.in_([ReportStatus.SUBMITTED, ReportStatus.UNDER_REVIEW, ReportStatus.ASSIGNED])
    ).count()
    return {
        "total_reported": total,
        "total_resolved": resolved,
        "in_progress": in_progress,
        "pending": pending,
        "resolution_rate": round((resolved / total * 100) if total > 0 else 0, 1),
    }


def get_map_data(db: Session) -> list[dict]:
    reports = db.query(Report).filter(Report.latitude.isnot(None), Report.longitude.isnot(None)).all()
    return [
        {
            "id": r.id,
            "report_number": r.report_number,
            "title": r.title,
            "category": r.category.value,
            "urgency": r.urgency.value,
            "status": r.status.value,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "location": r.location,
        }
        for r in reports
    ]
