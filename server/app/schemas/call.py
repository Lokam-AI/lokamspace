"""
Call schemas.
"""

from datetime import datetime
from typing import Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field


class CallBase(BaseModel):
    """Base call schema."""
    
    call_type: str  # Outbound, Inbound, Missed
    status: str = "Scheduled"  # Scheduled, In Progress, Completed, Failed, Missed
    scheduled_time: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    phone_number: str
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    service_record_id: Optional[int] = None
    campaign_id: Optional[int] = None
    tags: Optional[List[str]] = None


class CallCreate(CallBase):
    """Call creation schema."""
    
    organization_id: UUID


class CallUpdate(BaseModel):
    """Call update schema."""
    
    call_type: Optional[str] = None
    status: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    phone_number: Optional[str] = None
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    service_record_id: Optional[int] = None
    campaign_id: Optional[int] = None
    tags: Optional[List[str]] = None


class CallDB(CallBase):
    """Call database schema."""
    
    id: int
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TranscriptSnippet(BaseModel):
    """Transcript snippet schema."""
    
    text: str
    timestamp: datetime
    speaker: str


class CallResponse(CallDB):
    """Call response schema."""
    
    transcript_available: bool = False
    audio_available: bool = False
    transcript_snippets: Optional[List[TranscriptSnippet]] = None
    metrics: Optional[Dict[str, Union[float, str, bool]]] = None
