"""
Call Feedback schemas.
"""

from datetime import datetime
from typing import Dict, Optional, Any

from pydantic import BaseModel


class CallFeedbackBase(BaseModel):
    """Base call feedback schema."""
    
    kpis: Optional[Dict[str, Any]] = None  # Store KPIs as a dictionary
    type: Optional[str] = None  # Values like "positives", "detractors", etc.


class CallFeedbackCreate(CallFeedbackBase):
    """Call feedback creation schema."""
    
    call_id: int


class CallFeedbackUpdate(BaseModel):
    """Call feedback update schema."""
    
    kpis: Optional[Dict[str, Any]] = None
    type: Optional[str] = None


class CallFeedbackInDB(CallFeedbackBase):
    """Call feedback database schema."""
    
    id: int
    call_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CallFeedbackResponse(CallFeedbackInDB):
    """Call feedback response schema."""
    pass 