from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./dela_langa.db"
    SECRET_KEY: str = "dela-langa-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    UPLOAD_DIR: str = "uploads"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = ""
    GOOGLE_CLIENT_ID: str = ""
    PORT: int = 8000

    # Email alerts (SMTP)
    EMAIL_ENABLED: bool = False
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False
    SMTP_FROM_EMAIL: str = "noreply@delalanga.mw"
    SMTP_FROM_NAME: str = "Dela Langa"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        # Render Postgres uses postgres:// — SQLAlchemy requires postgresql://
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def cors_origins(self) -> list[str]:
        origins = {self.FRONTEND_URL, "http://localhost:3000"}
        if self.ALLOWED_ORIGINS:
            origins.update(o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip())
        return list(origins)


settings = Settings()
