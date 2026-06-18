from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from app.models.report import IssueCategory, UrgencyLevel, ReportStatus


class ReportCreate(BaseModel):
    category: IssueCategory
    title: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    urgency: Optional[UrgencyLevel] = None


class ReportUpdate(BaseModel):
    status: Optional[ReportStatus] = None
    department_id: Optional[int] = None
    assigned_officer_id: Optional[int] = None
    resolution_notes: Optional[str] = None


class AttachmentResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityResponse(BaseModel):
    id: int
    action: str
    description: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class FeedbackResponse(BaseModel):
    id: int
    message: str
    is_official: bool
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class CitizenInfo(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    citizen_id: Optional[str] = None
    district: Optional[str] = None
    area_village: Optional[str] = None

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    id: int
    report_number: str
    category: IssueCategory
    title: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    urgency: UrgencyLevel
    status: ReportStatus
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    assigned_officer_id: Optional[int] = None
    assigned_officer_name: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    citizen: Optional[CitizenInfo] = None
    attachments: List[AttachmentResponse] = []
    activities: List[ActivityResponse] = []
    feedback: List[FeedbackResponse] = []

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int
    page: int
    page_size: int
