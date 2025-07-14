"""
Transcript schemas.
"""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TranscriptSegment(BaseModel):
    """Transcript segment schema."""
    
    start_time: float
    end_time: float
    text: str
    speaker: str
    confidence: float = Field(0.0, ge=0.0, le=1.0)


class TranscriptBase(BaseModel):
    """Base transcript schema."""
    
    call_id: int
    segments: List[TranscriptSegment]
    language: str = "en-US"
    status: str = "Completed"  # Processing, Completed, Failed
    error_message: Optional[str] = None
    metadata: Optional[Dict] = None


class TranscriptCreate(TranscriptBase):
    """Transcript creation schema."""
    
    organization_id: UUID


class TranscriptUpdate(BaseModel):
    """Transcript update schema."""
    
    segments: Optional[List[TranscriptSegment]] = None
    language: Optional[str] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict] = None


class TranscriptDB(TranscriptBase):
    """Transcript database schema."""
    
    id: int
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TranscriptResponse(TranscriptDB):
    """Transcript response schema."""
    
    audio_available: bool = False
    call_duration: Optional[int] = None
    customer_name: Optional[str] = None
    sentiment_score: Optional[float] = None
    topics: Optional[List[str]] = None
