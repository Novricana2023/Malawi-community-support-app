from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import case, desc, asc

from app.models.report import Report, ReportStatus


def _solved_query(db: Session):
    return (
        db.query(Report)
        .options(
            joinedload(Report.citizen),
            joinedload(Report.department),
        )
        .filter(Report.status.in_([ReportStatus.RESOLVED, ReportStatus.CLOSED]))
    )


def _sort_by_resolved_date(query, sort_order: str = "desc"):
    resolved_date = case(
        (Report.resolved_at.isnot(None), Report.resolved_at),
        else_=Report.closed_at,
    )
    if sort_order == "asc":
        return query.order_by(asc(resolved_date), asc(Report.id))
    return query.order_by(desc(resolved_date), desc(Report.id))


def get_solved_reports(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    sort_order: str = "desc",
    citizen_id: int | None = None,
) -> tuple[list[Report], int]:
    query = _solved_query(db)
    if citizen_id is not None:
        query = query.filter(Report.citizen_id == citizen_id)
    total = query.count()
    reports = (
        _sort_by_resolved_date(query, sort_order)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return reports, total


def build_solved_public_item(report: Report, is_mine: bool = False) -> dict:
    resolved_at = report.resolved_at or report.closed_at
    return {
        "id": report.id,
        "report_number": report.report_number,
        "category": report.category.value,
        "title": report.title,
        "location": report.location,
        "area_village": report.citizen.area_village if report.citizen else None,
        "district": report.citizen.district if report.citizen else None,
        "status": report.status.value,
        "department_name": report.department.name if report.department else None,
        "resolution_notes": report.resolution_notes,
        "resolved_at": resolved_at.isoformat() if resolved_at else None,
        "created_at": report.created_at.isoformat(),
        "is_mine": is_mine,
    }
