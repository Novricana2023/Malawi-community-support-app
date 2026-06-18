from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.report import Report, ReportStatus, UrgencyLevel, IssueCategory
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse, ReportListResponse
from app.schemas.common import FeedbackCreate
from app.services.auth import get_current_user, require_official
from app.services.report_service import create_report, update_report, add_feedback, get_report_query, _build_report_response
from app.services.solved_service import get_solved_reports, build_solved_public_item, _solved_query
from app.services.pdf_service import generate_report_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportResponse)
async def submit_report(
    category: IssueCategory = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    files: list[UploadFile] = File(default=[]),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = ReportCreate(
        category=category, title=title, description=description,
        location=location, latitude=latitude, longitude=longitude,
    )
    report = create_report(db, user, data, files if files else None)
    return _build_report_response(report)


@router.get("/my", response_model=ReportListResponse)
def my_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = get_report_query(db).filter(Report.citizen_id == user.id)
    total = query.count()
    reports = query.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "reports": [_build_report_response(r) for r in reports],
        "total": total, "page": page, "page_size": page_size,
    }


@router.get("/solved")
def public_solved_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """Public list of community issues resolved by the District Office, sorted by date."""
    reports, total = get_solved_reports(db, page, page_size, sort_order)
    return {
        "reports": [build_solved_public_item(r) for r in reports],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/my/solved")
def my_solved_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Citizen's own resolved reports, sorted by resolution date."""
    reports, total = get_solved_reports(db, page, page_size, sort_order, citizen_id=user.id)
    return {
        "reports": [build_solved_public_item(r, is_mine=True) for r in reports],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/solved/{report_id}")
def public_solved_report_detail(report_id: int, db: Session = Depends(get_db)):
    """Public detail for a single resolved community issue."""
    report = (
        _solved_query(db)
        .filter(Report.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Solved report not found")
    return build_solved_public_item(report)


@router.get("/all", response_model=ReportListResponse)
def all_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ReportStatus] = None,
    urgency: Optional[UrgencyLevel] = None,
    category: Optional[IssueCategory] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    user: User = Depends(require_official),
    db: Session = Depends(get_db),
):
    query = get_report_query(db)
    if status:
        query = query.filter(Report.status == status)
    if urgency:
        query = query.filter(Report.urgency == urgency)
    if category:
        query = query.filter(Report.category == category)
    if search:
        query = query.filter(
            Report.title.ilike(f"%{search}%") |
            Report.report_number.ilike(f"%{search}%") |
            Report.location.ilike(f"%{search}%")
        )
    total = query.count()
    sort_col = getattr(Report, sort_by, Report.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())
    reports = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "reports": [_build_report_response(r) for r in reports],
        "total": total, "page": page, "page_size": page_size,
    }


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = get_report_query(db).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    from app.models.user import UserRole
    if user.role == UserRole.CITIZEN and report.citizen_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _build_report_response(report)


@router.patch("/{report_id}", response_model=ReportResponse)
def update_report_endpoint(
    report_id: int,
    data: ReportUpdate,
    user: User = Depends(require_official),
    db: Session = Depends(get_db),
):
    report = update_report(db, report_id, data, user)
    return _build_report_response(report)


@router.post("/{report_id}/feedback")
def add_report_feedback(
    report_id: int,
    data: FeedbackCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.user import UserRole
    is_official = user.role in (UserRole.OFFICIAL, UserRole.ADMIN)
    feedback = add_feedback(db, report_id, user, data.message, is_official)
    return {"id": feedback.id, "message": feedback.message}


@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = get_report_query(db).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    from app.models.user import UserRole
    if user.role == UserRole.CITIZEN and report.citizen_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    pdf_bytes = generate_report_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={report.report_number}.pdf"},
    )
