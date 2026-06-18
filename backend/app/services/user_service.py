from sqlalchemy.orm import Session
from app.models.user import User, UserRole


def generate_citizen_id(db: Session) -> str:
    last_user = db.query(User).filter(User.citizen_id.isnot(None)).order_by(User.id.desc()).first()
    if last_user and last_user.citizen_id:
        try:
            num = int(last_user.citizen_id.split("-")[-1]) + 1
        except ValueError:
            num = 1
    else:
        num = 1
    return f"DL-CIT-{num:06d}"


def get_or_create_user(
    db: Session,
    email: str,
    full_name: str,
    role: UserRole = UserRole.CITIZEN,
    google_id: str | None = None,
    avatar_url: str | None = None,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        if google_id and not user.google_id:
            user.google_id = google_id
        if avatar_url:
            user.avatar_url = avatar_url
        if full_name:
            user.full_name = full_name
        db.commit()
        db.refresh(user)
        return user

    citizen_id = generate_citizen_id(db) if role == UserRole.CITIZEN else None
    user = User(
        email=email,
        full_name=full_name,
        role=role,
        google_id=google_id,
        avatar_url=avatar_url,
        citizen_id=citizen_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
