"""
Configuration for request logging middleware.
"""

from typing import List, Optional

from app.core.config import settings


class LoggingConfig:
    """Configuration class for request logging middleware."""
    
    # Whether to log request bodies
    LOG_REQUEST_BODY: bool = getattr(settings, 'LOG_REQUEST_BODY', True)
    
    # Paths to exclude from logging
    EXCLUDE_PATHS: List[str] = getattr(settings, 'EXCLUDE_PATHS', [
        "/health",
        "/metrics", 
        "/docs",
        "/openapi.json",
        "/favicon.ico"
    ])
    
    # Log level for different response status codes
    SUCCESS_LOG_LEVEL: str = getattr(settings, 'SUCCESS_LOG_LEVEL', 'INFO')
    ERROR_LOG_LEVEL: str = getattr(settings, 'ERROR_LOG_LEVEL', 'ERROR')
    
    # Maximum body size to log (in bytes)
    MAX_BODY_SIZE: int = getattr(settings, 'MAX_BODY_SIZE', 1000)
    
    # Whether to include request ID in logs
    INCLUDE_REQUEST_ID: bool = getattr(settings, 'INCLUDE_REQUEST_ID', True) 