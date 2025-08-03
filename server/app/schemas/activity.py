"""
Activity schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ActivityBase(BaseModel):
    """Base activity schema."""
    type: str
    title: str
    description: str
    count: Optional[int] = None
    timestamp: datetime
    priority: int


class ActivityResponse(ActivityBase):
    """Activity response schema."""
    pass


class RecentActivitiesResponse(BaseModel):
    """Recent activities response schema."""
    target_date: str
    activities: list[ActivityResponse] 