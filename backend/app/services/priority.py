from datetime import datetime
from app.models.report import IssueCategory, UrgencyLevel

EMERGENCY_CATEGORIES = {
    IssueCategory.FIRE_INCIDENTS,
    IssueCategory.FLOODING,
    IssueCategory.BROKEN_BRIDGES,
    IssueCategory.INFRASTRUCTURE_DAMAGE,
}

HIGH_CATEGORIES = {
    IssueCategory.ROAD_DAMAGE,
    IssueCategory.POTHOLES,
    IssueCategory.WATER_PROBLEMS,
    IssueCategory.STREET_LIGHTS,
    IssueCategory.ILLEGAL_DUMPING,
}


def detect_priority(category: IssueCategory) -> UrgencyLevel:
    if category in EMERGENCY_CATEGORIES:
        return UrgencyLevel.EMERGENCY
    if category in HIGH_CATEGORIES:
        return UrgencyLevel.HIGH
    return UrgencyLevel.NORMAL


def generate_report_number(db_count: int) -> str:
    year = datetime.utcnow().year
    return f"DL-{year}-{db_count + 1:06d}"
