from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.activity import ActivityHistory


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    report_id: int | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        report_id=report_id,
    )
    db.add(notification)
    return notification


def log_activity(
    db: Session,
    report_id: int,
    action: str,
    description: str,
    user_id: int | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
) -> ActivityHistory:
    activity = ActivityHistory(
        report_id=report_id,
        user_id=user_id,
        action=action,
        description=description,
        old_value=old_value,
        new_value=new_value,
    )
    db.add(activity)
    return activity
