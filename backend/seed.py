from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.report import Report, ReportStatus, IssueCategory, UrgencyLevel
from app.models.department import Department
from app.services.user_service import get_or_create_user, generate_citizen_id
from app.services.priority import detect_priority, generate_report_number


MALAWI_AREAS = [
    "Area 25", "Area 47", "Chilinde", "Kawale", "Lilongwe City Centre",
    "Mgona", "Mtandire", "Ng'onga", "Nkhoma", "Tsabango",
    "Balaka Township", "Machinga Boma", "Zomba Central", "Blantyre Ndirande",
]

SAMPLE_ISSUES = [
    ("Major potholes on main road", IssueCategory.POTHOLES, "Large potholes causing vehicle damage along the main district road."),
    ("Broken street lights", IssueCategory.STREET_LIGHTS, "Multiple street lights not working for over two weeks."),
    ("Flooding after heavy rains", IssueCategory.FLOODING, "Severe flooding blocking access to the market area."),
    ("Illegal waste dumping", IssueCategory.ILLEGAL_DUMPING, "Residents dumping waste near the community water source."),
    ("Water pipe burst", IssueCategory.WATER_PROBLEMS, "Main water pipe burst leaving 500 households without water."),
    ("Bridge structural damage", IssueCategory.BROKEN_BRIDGES, "Community bridge showing signs of structural failure."),
    ("Road surface deterioration", IssueCategory.ROAD_DAMAGE, "Road surface completely deteriorated, impassable during rains."),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    citizens = []
    for i in range(5):
        email = f"citizen{i + 1}@example.mw"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = get_or_create_user(
                db, email, f"Citizen User {i + 1}", UserRole.CITIZEN
            )
            user.phone = f"+265 99{random.randint(1000000, 9999999)}"
            user.district = "Lilongwe"
            user.area_village = random.choice(MALAWI_AREAS)
            db.commit()
        citizens.append(user)

    departments = db.query(Department).all()
    statuses = list(ReportStatus)

    existing = db.query(Report).count()
    for i, (title, category, description) in enumerate(SAMPLE_ISSUES):
        report_num = generate_report_number(existing + i)
        citizen = random.choice(citizens)
        status = random.choice(statuses)
        report = Report(
            report_number=report_num,
            citizen_id=citizen.id,
            category=category,
            title=title,
            description=description,
            location=f"{citizen.area_village}, Lilongwe District",
            latitude=-13.9626 + random.uniform(-0.1, 0.1),
            longitude=33.7741 + random.uniform(-0.1, 0.1),
            urgency=detect_priority(category),
            status=status,
            department_id=random.choice(departments).id if departments and status != ReportStatus.SUBMITTED else None,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
        )
        if status in (ReportStatus.RESOLVED, ReportStatus.CLOSED):
            report.resolved_at = report.created_at + timedelta(days=random.randint(3, 14))
        db.add(report)

    db.commit()
    print("Seed data created successfully!")
    db.close()


if __name__ == "__main__":
    seed()
