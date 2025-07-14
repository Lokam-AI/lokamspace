"""
Configuration settings for the application.
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, field_validator, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # Project metadata
    PROJECT_NAME: str = "AutoPulse"
    PROJECT_DESCRIPTION: str = "Auto service center call management system"
    PROJECT_VERSION: str = "0.1.0"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Security
    SECRET_KEY: str = "dev_secret_key_replace_in_production"
    JWT_SECRET: str = "dev_jwt_secret_replace_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 60 * 60 * 24  # 1 day
    
    # Database - Direct URL takes precedence if provided
    DATABASE_URL: Optional[str] = None
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5433"
    POSTGRES_USER: str = "autopulse"
    POSTGRES_PASSWORD: str = "autopulse"
    POSTGRES_DB: str = "autopulse"
    
    # Database settings
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False
    CREATE_TABLES_ON_STARTUP: bool = True
    
    # CORS - Default to allowing all origins in development
    # Change to explicitly use a string to avoid parsing issues with .env file
    CORS_ORIGINS: str = "*"

    # VAPI Settings
    VAPI_API_KEY: str = "your_api_key_here"
    VAPI_ASSISTANT_ID: str = "your_assistant_id_here"
    VAPI_DEMO_ASSISTANT_ID: str = "your_demo_assistant_id_here"
    VAPI_PHONE_NUMBER_ID: str = "your_phone_number_id_here"
    
    # VAPI Webhook Settings
    VAPI_WEBHOOK_SECRET: str = "your_webhook_secret_here"
    VAPI_WEBHOOK_URL: str = "/api/v1/webhooks/vapi-webhook"
    
    # OpenAI Settings
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_API_KEY: str = "your_openai_api_key_here"
    OPENAI_MODEL: str = "gpt-4o-2024-08-06"  # Default model for call analysis
    OPENAI_MAX_TOKENS: int = 1000
    OPENAI_TEMPERATURE: float = 0.2
    
    # Model configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )
    
    @property
    def db_url(self) -> str:
        """Get the database URL, either from DATABASE_URL or build from components."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        
        # Construct URL from components
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @field_validator("LOG_LEVEL")
    @classmethod
    def parse_log_level(cls, v: str) -> Any:
        """Parse log level string to logging level."""
        levels = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARNING": logging.WARNING,
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL,
        }
        
        return levels.get(v.upper(), logging.INFO)
    
    @field_validator("CORS_ORIGINS")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from string or list."""
        # If we already have a list, return it
        if isinstance(v, list):
            return v
        
        # Handle empty or None values
        if not v:
            return ["*"]  # Default to allow all origins
            
        # Handle string values
        if isinstance(v, str):
            # Special case for wildcard
            if v == "*":
                return ["*"]
                
            # Check if it's a JSON string
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    # If JSON parsing fails, treat as comma-separated
                    pass
            
            # Handle comma-separated string
            if "," in v:
                return [i.strip() for i in v.split(",")]
            
            # Single value
            return [v]
        
        # Fallback to default
        return ["*"]


# Create settings instance
settings = Settings()
