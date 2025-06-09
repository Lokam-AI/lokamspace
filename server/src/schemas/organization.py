from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class OrganizationResponse(BaseModel):
    id: int
    name: str
    address: Optional[str]
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True 