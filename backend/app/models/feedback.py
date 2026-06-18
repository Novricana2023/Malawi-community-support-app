from datetime import datetime

from sqlalchemy import String, DateTime, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text)
    is_official: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="feedback")
    user = relationship("User")
