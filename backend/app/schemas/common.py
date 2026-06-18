from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    head_officer: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    message: str


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    report_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
