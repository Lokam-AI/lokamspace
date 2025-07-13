"""
Webhook schemas.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel

class WebhookResponse(BaseModel):
    """Response model for webhook endpoints."""
    
    status: str
    message: str
    database_updated: Optional[bool] = None
    error: Optional[str] = None 