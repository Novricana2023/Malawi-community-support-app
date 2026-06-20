import time
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

logger = logging.getLogger(__name__)

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine_kwargs = {
    "pool_pre_ping": True,
    "connect_args": connect_args,
}
if not is_sqlite:
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def wait_for_database(max_attempts: int = 20, delay_seconds: float = 3.0) -> None:
    """Retry DB connection on startup (Render Postgres may not be ready immediately)."""
    if is_sqlite:
        return
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established")
            return
        except Exception as exc:
            logger.warning("Database connection attempt %s/%s failed: %s", attempt, max_attempts, exc)
            if attempt == max_attempts:
                raise
            time.sleep(delay_seconds)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
