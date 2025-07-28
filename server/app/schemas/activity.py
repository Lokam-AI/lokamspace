"""
Activity schemas.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class Activity(BaseModel):
    """Activity schema."""
    
    type: str
    title: str
    description: str
    count: int
    timestamp: str
    priority: int
    is_fallback: Optional[bool] = False


class RecentActivitiesResponse(BaseModel):
    """Recent activities response schema."""
    
    activities: List[Activity]
    date: str
