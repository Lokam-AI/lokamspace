from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # VAPI Configuration
    VAPI_API_KEY: str
    ASSISTANT_SECRET_TOKEN: str
    PHONE_NUMBER_ID: str
    SURVEY_ASSISTANT_ID: str
    
    # Database Configuration
    DATABASE_URL: str
    
    # Security Configuration
    SECURITY_TOKEN: str
    
    # Webhook Configuration
    WEBHOOK_ENDPOINT: str = "/vapi-webhook"
    CALL_REPORTS_DIR: str = "call_reports"
    
    # Application Configuration
    APP_NAME: str = "Agent Pulse Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 