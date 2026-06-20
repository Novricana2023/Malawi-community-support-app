from urllib.parse import quote_plus

from pydantic import field_validator, model_validator
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

    # Render Postgres components (preferred over raw connectionString)
    PGHOST: str = ""
    PGPORT: int = 5432
    PGUSER: str = ""
    PGPASSWORD: str = ""
    PGDATABASE: str = ""

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
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @model_validator(mode="after")
    def assemble_database_url(self) -> "Settings":
        if self.PGHOST and self.PGUSER and self.PGPASSWORD and self.PGDATABASE:
            password = quote_plus(self.PGPASSWORD)
            url = f"postgresql://{self.PGUSER}:{password}@{self.PGHOST}:{self.PGPORT}/{self.PGDATABASE}"
            if "render.com" in self.PGHOST and "sslmode=" not in url:
                url += "?sslmode=require"
            object.__setattr__(self, "DATABASE_URL", url)
        elif self.DATABASE_URL.startswith("postgresql") and "render.com" in self.DATABASE_URL:
            if "sslmode=" not in self.DATABASE_URL:
                sep = "&" if "?" in self.DATABASE_URL else "?"
                object.__setattr__(self, "DATABASE_URL", f"{self.DATABASE_URL}{sep}sslmode=require")
        return self

    @property
    def cors_origins(self) -> list[str]:
        origins = {self.FRONTEND_URL, "http://localhost:3000"}
        if self.ALLOWED_ORIGINS:
            origins.update(o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip())
        return list(origins)


settings = Settings()
