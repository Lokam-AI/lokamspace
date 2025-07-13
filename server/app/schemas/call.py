"""
Call schemas.
"""

from datetime import datetime
from typing import Dict, List, Optional, Union, Any
from uuid import UUID

from pydantic import BaseModel, Field, validator


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
    
    # Added fields for feedback calls
    nps_score: Optional[int] = None
    call_reason: Optional[str] = None
    feedback_summary: Optional[str] = None
    call_summary: Optional[str] = None  # New field for call summary
    service_advisor_id: Optional[int] = None
    service_advisor_name: Optional[str] = None
    vehicle_info: Optional[str] = None
    service_type: Optional[str] = None  # Added service type from service record

    # Flag for demo calls
    is_demo: bool = False


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
    
    # Added fields for feedback calls
    nps_score: Optional[int] = None
    call_reason: Optional[str] = None
    feedback_summary: Optional[str] = None
    call_summary: Optional[str] = None  # New field for call summary
    service_advisor_id: Optional[int] = None
    service_advisor_name: Optional[str] = None
    vehicle_info: Optional[str] = None
    service_type: Optional[str] = None  # Added service type from service record
    
    # Flag for demo calls
    is_demo: Optional[bool] = None


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


# New schema for bulk call uploads
class BulkCallUpload(BaseModel):
    """Schema for bulk call upload from CSV."""
    campaign_name: str = Field(..., description="Name of the campaign for these calls")
    calls: List[Dict] = Field(..., description="List of calls from CSV")
    
    class Config:
        """Config for BulkCallUpload."""
        json_schema_extra = {
            "example": {
                "campaign_name": "Spring Service Follow-up",
                "calls": [
                    {
                        "customer_name": "John Doe",
                        "customer_number": "+19029897685",
                        "vehicle_info": "2019 Honda Civic",
                        "service_type": "Oil Change",
                        "call_reason": "Service follow-up",
                        "service_advisor_name": "Mike Smith"
                    }
                ]
            }
        }


class CSVTemplateResponse(BaseModel):
    """Response model for CSV template."""
    headers: List[str]
    sample_row: List[str]


class CallDetailResponse(BaseModel):
    """Detailed call response schema."""
    
    # Call fields
    id: int
    customer_number: str
    direction: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_sec: Optional[int] = None
    status: str
    recording_url: Optional[str] = None
    nps_score: Optional[int] = None
    call_reason: Optional[str] = None
    feedback_summary: Optional[str] = None
    call_summary: Optional[str] = None  # New field for call summary
    cost: Optional[float] = None  # Added cost field for call details
    
    # ServiceRecord fields
    customer_name: Optional[str] = None
    vehicle_info: Optional[str] = None
    service_type: Optional[str] = None
    service_advisor_name: Optional[str] = None
    appointment_date: Optional[datetime] = None  # Added appointment date field
    
    # Feedback and KPI fields
    positive_mentions: Optional[List[str]] = None
    areas_to_improve: Optional[List[str]] = None
    tags: Optional[Dict[str, List[str]]] = None  # Dictionary of tag categories (positives, negatives)
    
    # Transcript fields
    transcript: Optional[List[Dict[str, Any]]] = None  # List of transcript segments
    
    # Derived fields
    call_duration: Optional[str] = None  # Formatted duration
    attempt_count: int = 1  # Default to 1, can be calculated if needed
    customer_email: Optional[str] = None  # If available
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "organization_id": "123e4567-e89b-12d3-a456-426614174000",
                "service_record_id": 1,
                "customer_number": "+1234567890",
                "direction": "outbound",
                "start_time": "2023-06-01T12:00:00Z",
                "end_time": "2023-06-01T12:05:00Z",
                "duration_sec": 300,
                "status": "Completed",
                "recording_url": "https://example.com/recording.mp3",
                "nps_score": 9,
                "call_reason": "Service Feedback",
                "feedback_summary": "Customer was very satisfied",
                "cost": 0.25,
                "created_at": "2023-06-01T12:00:00Z",
                "updated_at": "2023-06-01T12:05:00Z"
            }
        }
