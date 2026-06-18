import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, reports, dashboard
from app.models.department import Department
from app.models.user import User, UserRole
from app.services.user_service import get_or_create_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    db = SessionLocal()
    try:
        if db.query(Department).count() == 0:
            departments = [
                Department(name="Roads & Transport", description="Road maintenance and transport infrastructure", head_officer="Eng. Chisomo Banda"),
                Department(name="Water & Sanitation", description="Water supply and sanitation services", head_officer="Dr. Grace Phiri"),
                Department(name="Public Works", description="Public infrastructure and buildings", head_officer="Mr. James Mwale"),
                Department(name="Environment & Waste", description="Environmental protection and waste management", head_officer="Mrs. Agnes Kumwenda"),
                Department(name="Emergency Services", description="Fire, flood, and emergency response", head_officer="Capt. Peter Nkhoma"),
                Department(name="Community Development", description="Community projects and social development", head_officer="Ms. Ruth Chirwa"),
            ]
            db.add_all(departments)
            db.commit()

        official = db.query(User).filter(User.email == "official@soso.malawi.gov.mw").first()
        if not official:
            get_or_create_user(
                db, "official@soso.malawi.gov.mw", "District Commissioner", UserRole.OFFICIAL
            )
    finally:
        db.close()
    yield


app = FastAPI(
    title="Dela Langa API",
    description="Community Development Management System for Malawi",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "healthy", "platform": "Dela Langa", "version": "1.0.0"}
