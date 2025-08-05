"""
API Key schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class ApiKeyBase(BaseModel):
    """Base API Key schema."""
    name: str = Field(..., min_length=1, max_length=255)
    rate_limit_per_minute: int = Field(default=10, ge=1, le=1000)
    webhook_url: Optional[str] = Field(None, max_length=2048)
    webhook_secret: Optional[str] = Field(None, max_length=255)
    webhook_timeout: int = Field(default=30, ge=5, le=300)
    webhook_headers: Optional[Dict[str, str]] = None


class ApiKeyCreate(ApiKeyBase):
    """Schema for creating an API key."""
    pass


class ApiKeyUpdate(BaseModel):
    """Schema for updating an API key."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None
    rate_limit_per_minute: Optional[int] = Field(None, ge=1, le=1000)
    webhook_url: Optional[str] = Field(None, max_length=2048)
    webhook_secret: Optional[str] = Field(None, max_length=255)
    webhook_timeout: Optional[int] = Field(None, ge=5, le=300)
    webhook_headers: Optional[Dict[str, str]] = None


class ApiKeyResponse(ApiKeyBase):
    """Schema for API key responses."""
    id: UUID
    organization_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    last_used_at: Optional[datetime]
    usage_count: int
    secret_key_preview: str  # Only first 4 and last 4 characters
    created_by_name: str

    class Config:
        from_attributes = True


class ApiKeySecret(BaseModel):
    """Schema for returning the full secret key (only shown once)."""
    id: UUID
    name: str
    secret_key: str
    
    class Config:
        from_attributes = True