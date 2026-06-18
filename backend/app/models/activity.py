from datetime import datetime

from sqlalchemy import String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ActivityHistory(Base):
    __tablename__ = "activity_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id"))
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    old_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    new_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="activities")
    user = relationship("User", back_populates="activities")
