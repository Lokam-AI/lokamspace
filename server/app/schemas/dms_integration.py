"""
Schemas for DMS integration.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID


class DMSIntegrationBase(BaseModel):
    """Base schema for DMS integration."""
    name: str
    type: str  # e.g., "CDK", "Reynolds", "DealerTrack"
    config: Dict[str, Any]  # Credentials, endpoints, etc.
    timeout_seconds: int = 20
    is_active: bool = True


class DMSIntegrationCreate(DMSIntegrationBase):
    """Schema for creating a DMS integration."""
    organization_id: UUID


class DMSIntegrationUpdate(BaseModel):
    """Schema for updating a DMS integration."""
    name: Optional[str] = None
    type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = None
    is_active: Optional[bool] = None


class DMSIntegrationResponse(DMSIntegrationBase):
    """Schema for DMS integration response."""
    id: int
    organization_id: UUID
    
    class Config:
        from_attributes = True 