from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, Token, GoogleAuthRequest, DemoLoginRequest
from app.services.auth import create_access_token, get_current_user
from app.services.user_service import get_or_create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=Token)
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    user = get_or_create_user(
        db, data.email, data.full_name, data.role, data.google_id, data.avatar_url
    )
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "user": user}


@router.post("/demo-login", response_model=Token)
def demo_login(data: DemoLoginRequest, db: Session = Depends(get_db)):
    user = get_or_create_user(db, data.email, data.full_name, data.role)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
def update_profile(data: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
