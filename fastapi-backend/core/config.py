from pydantic_settings import BaseSettings
from functools import lru_cache
from sqlalchemy.engine.url import URL
from typing import Optional
import urllib.parse

class Settings(BaseSettings):
    PROJECT_NAME: str = "Municipal Digital Twins"
    DATABASE_URL: Optional[str] = None
    DB_USER: str = "p5admin"
    DB_PASSWORD: str = "local_dev_password"
    DB_HOST: str = "db"
    DB_PORT: str = "5432"
    DB_NAME: str = "p5digital"
    
    SECRET_KEY: str = "your-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL and not self.DATABASE_URL.startswith("postgresql://${DB_USER"):
            return self.DATABASE_URL
        # Safely URL-encode the password to handle special characters like @
        safe_password = urllib.parse.quote_plus(self.DB_PASSWORD)
        return f"postgresql+psycopg://{self.DB_USER}:{safe_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()
