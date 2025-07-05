"""
Schedule configuration schemas.
"""

from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel


class ScheduleConfigBase(BaseModel):
    """Base schedule configuration schema."""
    
    start_time: str  # Format: "HH:MM" (24-hour)
    end_time: str  # Format: "HH:MM" (24-hour)
    timezone: str  # IANA timezone string (e.g., "America/New_York")
    active_days: List[str]  # Days of week: "monday", "tuesday", etc.
    auto_call_enabled: bool = True


class ScheduleConfigCreate(ScheduleConfigBase):
    """Schedule configuration create schema."""
    
    organization_id: UUID
    campaign_id: Optional[int] = None


class ScheduleConfigUpdate(BaseModel):
    """Schedule configuration update schema."""
    
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    timezone: Optional[str] = None
    active_days: Optional[List[str]] = None
    auto_call_enabled: Optional[bool] = None


class ScheduleConfigDB(ScheduleConfigBase):
    """Schedule configuration database schema."""
    
    id: int
    organization_id: UUID
    campaign_id: Optional[int] = None
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class ScheduleConfigResponse(ScheduleConfigDB):
    """Schedule configuration response schema."""
    pass 