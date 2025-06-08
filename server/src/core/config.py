from pydantic_settings import BaseSettings  # Correct import
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Base
    ENV: str = "development"
    DEBUG: bool = True
    APP_TITLE: str = "LokamSpace API"
    APP_DESCRIPTION: str = "Customer Management and Survey Platform"
    
    # Database
    DATABASE_URL: str = "sqlite:///./lokamspace.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://192.168.2.18:3000"
    ]
    
    # Email Configuration
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # AWS Configuration (if needed)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None

    # LiveKit Configuration
    LIVEKIT_URL: str = "wss://your-livekit-server"
    LIVEKIT_API_KEY: str = ""
    LIVEKIT_API_SECRET: str = ""
    LIVEKIT_SIP_TRUNK_ID: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields in the environment


@lru_cache()
def get_settings() -> Settings:
    """
    Get settings instance with caching.
    Use this function to get settings throughout the application.
    """
    return Settings()


# Create a settings instance
settings = get_settings()