"""
Feedback Call schemas for API integration.
"""

from typing import Optional, Dict, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ClientDetails(BaseModel):
    """Client details for feedback call."""
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    service_advisor_name: Optional[str] = None
    service_type: Optional[str] = None
    last_service_comment: Optional[str] = None
    vehicle_info: Optional[str] = None
    appointment_date: Optional[datetime] = None


class OrganizationDetails(BaseModel):
    """Organization details for feedback call."""
    organization_name: Optional[str] = None
    organization_description: Optional[str] = None
    service_centre_description: Optional[str] = None
    location: Optional[str] = None
    google_review_link: Optional[str] = None
    areas_to_focus: Optional[str] = None


class KnowledgeFile(BaseModel):
    """Knowledge file information."""
    name: str
    size: str
    type: str


class WebhookConfiguration(BaseModel):
    """Webhook configuration for callbacks."""
    server_url: str
    timeout: int = Field(default=20, ge=5, le=300)
    http_headers: Dict[str, str] = Field(default_factory=dict)


class FeedbackCall(BaseModel):
    """Complete feedback call configuration."""
    client_details: ClientDetails
    organization_details: OrganizationDetails
    knowledge_files: List[KnowledgeFile] = Field(default_factory=list)
    webhook_configuration: WebhookConfiguration


class FeedbackCallRequest(BaseModel):
    """Request wrapper for feedback call."""
    feedback_call: FeedbackCall


class FeedbackCallResponse(BaseModel):
    """Response for created feedback call."""
    id: str
    status: str
    created_at: str
    message: str
    call_details: Dict[str, Any]