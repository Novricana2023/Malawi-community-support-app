import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    OFFICIAL = "official"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    area_village: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citizen_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CITIZEN)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    department_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reports = relationship("Report", back_populates="citizen", foreign_keys="Report.citizen_id")
    assigned_reports = relationship("Report", back_populates="assigned_officer", foreign_keys="Report.assigned_officer_id")
    notifications = relationship("Notification", back_populates="user")
    activities = relationship("ActivityHistory", back_populates="user")
