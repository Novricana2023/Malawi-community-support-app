import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Enum, Integer, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class IssueCategory(str, enum.Enum):
    ROAD_DAMAGE = "road_damage"
    POTHOLES = "potholes"
    BROKEN_BRIDGES = "broken_bridges"
    STREET_LIGHTS = "street_lights"
    WASTE_MANAGEMENT = "waste_management"
    ILLEGAL_DUMPING = "illegal_dumping"
    FLOODING = "flooding"
    FIRE_INCIDENTS = "fire_incidents"
    WATER_PROBLEMS = "water_problems"
    INFRASTRUCTURE_DAMAGE = "infrastructure_damage"
    ENVIRONMENTAL = "environmental"
    OTHER = "other"


class UrgencyLevel(str, enum.Enum):
    EMERGENCY = "emergency"
    HIGH = "high"
    NORMAL = "normal"


class ReportStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    category: Mapped[IssueCategory] = mapped_column(Enum(IssueCategory))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str] = mapped_column(String(500))
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    urgency: Mapped[UrgencyLevel] = mapped_column(Enum(UrgencyLevel), default=UrgencyLevel.NORMAL)
    status: Mapped[ReportStatus] = mapped_column(Enum(ReportStatus), default=ReportStatus.SUBMITTED)
    department_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("departments.id"), nullable=True)
    assigned_officer_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    citizen = relationship("User", back_populates="reports", foreign_keys=[citizen_id])
    assigned_officer = relationship("User", back_populates="assigned_reports", foreign_keys=[assigned_officer_id])
    department = relationship("Department", back_populates="reports")
    attachments = relationship("ReportAttachment", back_populates="report", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="report", cascade="all, delete-orphan")
    activities = relationship("ActivityHistory", back_populates="report", cascade="all, delete-orphan")


class ReportAttachment(Base):
    __tablename__ = "report_attachments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id"))
    file_name: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    file_type: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="attachments")
