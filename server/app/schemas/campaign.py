"""
Campaign schemas.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CampaignBase(BaseModel):
    """Base campaign schema."""
    
    name: str
    description: Optional[str] = None
    status: str = "Draft"  # Draft, Active, Paused, Completed
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_count: Optional[int] = None
    priority: int = 1
    tags: Optional[List[str]] = None


class CampaignCreate(CampaignBase):
    """Campaign creation schema."""
    
    organization_id: UUID


class CampaignUpdate(BaseModel):
    """Campaign update schema."""
    
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_count: Optional[int] = None
    priority: Optional[int] = None
    tags: Optional[List[str]] = None


class CampaignDB(CampaignBase):
    """Campaign database schema."""
    
    id: int
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignResponse(CampaignDB):
    """Campaign response schema."""
    
    completion_rate: Optional[float] = None
    call_count: Optional[int] = None
