from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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

    class Config:
        from_attributes = True