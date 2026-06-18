from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.common import DepartmentResponse, NotificationResponse
from app.services.auth import get_current_user, require_official
from app.models.user import User
from app.models.department import Department
from app.models.notification import Notification
from app.services.analytics_service import (
    get_dashboard_stats, get_issues_by_category, get_issues_by_area,
    get_monthly_trends, get_resolution_performance, get_transparency_stats, get_map_data,
)
from app.services.pdf_service import generate_district_report_pdf

router = APIRouter(tags=["Dashboard & Analytics"])


@router.get("/departments", response_model=list[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


@router.get("/dashboard/stats")
def dashboard_stats(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return get_dashboard_stats(db)


@router.get("/dashboard/by-category")
def issues_by_category(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return get_issues_by_category(db)


@router.get("/dashboard/by-area")
def issues_by_area(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return get_issues_by_area(db)


@router.get("/dashboard/monthly-trends")
def monthly_trends(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return get_monthly_trends(db)


@router.get("/dashboard/resolution-performance")
def resolution_performance(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return get_resolution_performance(db)


@router.get("/transparency")
def transparency_stats(db: Session = Depends(get_db)):
    return get_transparency_stats(db)


@router.get("/map")
def map_data(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return get_map_data(db)


@router.get("/notifications", response_model=list[NotificationResponse])
def get_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user.id
    ).first()
    if notification:
        notification.is_read = True
        db.commit()
    return {"success": True}


@router.get("/reports/export/district-summary")
def export_district_summary(user: User = Depends(require_official), db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db)
    stats["by_category"] = {item["category"]: item["count"] for item in get_issues_by_category(db)}
    pdf_bytes = generate_district_report_pdf(stats)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=district-development-report.pdf"},
    )
