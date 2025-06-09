from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Union, Dict

class CallInteractionResponse(BaseModel):
    id: int
    call_date: datetime
    status: Optional[str]
    duration_seconds: Optional[int]
    transcription: Optional[str]
    overall_feedback: Optional[str]
    overall_score: Optional[float]
    timeliness_score: Optional[float]
    cleanliness_score: Optional[float]
    advisor_helpfulness_score: Optional[float]
    work_quality_score: Optional[float]
    recommendation_score: Optional[float]
    action_items: Optional[str]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class ServiceRecordBase(BaseModel):
    vehicle_number: str
    service_details: str
    service_date: Optional[datetime] = None

class ServiceRecordCreate(ServiceRecordBase):
    customer_name: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

class ServiceRecordResponse(ServiceRecordBase):
    id: int
    customer_id: int
    customer_name: str
    customer_email: Optional[str]
    customer_phone: Optional[str]
    assigned_user_id: Optional[int]
    created_at: datetime
    status: str
    call_interactions: List[CallInteractionResponse]

    class Config:
        from_attributes = True