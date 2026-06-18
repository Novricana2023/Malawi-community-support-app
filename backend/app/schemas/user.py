from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    district: Optional[str] = None
    area_village: Optional[str] = None


class UserCreate(UserBase):
    role: UserRole = UserRole.CITIZEN
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    area_village: Optional[str] = None


class UserResponse(UserBase):
    id: int
    citizen_id: Optional[str] = None
    role: UserRole
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GoogleAuthRequest(BaseModel):
    email: str
    full_name: str
    google_id: str
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.CITIZEN


class DemoLoginRequest(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.CITIZEN
