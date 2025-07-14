"""
Settings schemas.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SettingBase(BaseModel):
    """Base setting schema."""
    
    key: str
    value: Any
    category: str
    description: Optional[str] = None


class SettingCreate(SettingBase):
    """Setting creation schema."""
    
    organization_id: UUID


class SettingUpdate(BaseModel):
    """Setting update schema."""
    
    value: Any
    description: Optional[str] = None


class SettingDB(SettingBase):
    """Setting database schema."""
    
    id: int
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SettingResponse(SettingDB):
    """Setting response schema."""
    pass


class OrganizationSettingsResponse(BaseModel):
    """Organization settings response schema."""
    
    organization_id: UUID
    settings: Dict[str, Dict[str, Any]] 