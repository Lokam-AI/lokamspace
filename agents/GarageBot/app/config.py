from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "GarageBot"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    API_KEY: str
    
    # Database settings
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    
    # LiveKit settings
    LIVEKIT_API_KEY: str
    LIVEKIT_API_SECRET: str
    LIVEKIT_URL: str
    LIVEKIT_SIP_TRUNK_ID: str
    
    # AI Model settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 150
    
    # AWS settings
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    
    # Security settings
    CORS_ORIGINS: list[str] = ["*"]
    API_KEY_HEADER: str = "X-API-Key"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Cached settings to avoid reading the environment each time."""
    return Settings() 

