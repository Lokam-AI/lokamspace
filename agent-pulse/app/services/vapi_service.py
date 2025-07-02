from typing import Dict, Any
import httpx
from app.core.logging import get_logger
from app.config import get_settings

settings = get_settings()
logger = get_logger(__name__)

class VAPIService:
    """Service for interacting with VAPI API."""
    
    def __init__(self):
        self.base_url = "https://api.vapi.ai"
        self.headers = {
            "Authorization": f"Bearer {settings.VAPI_API_KEY}",
            "Content-Type": "application/json"
        }

    async def create_call(
        self,
        phone: str,
        customer_name: str,
        service_advisor_name: str,
        service_type: str,
        organization_name: str,
        location: str,
        google_review_link: str | None = None,
        call_id: int | None = None
    ) -> Dict[str, Any]:
        """
        Create a new call using VAPI's API.
        
        Args:
            phone: Customer phone number
            customer_name: Name of the customer
            service_advisor_name: Name of the service advisor
            service_type: Type of service
            organization_name: Name of the organization
            location: Location of the organization
            google_review_link: Optional Google review link
            call_id: Optional call ID for webhook identification
            
        Returns:
            VAPI API response
            
        Raises:
            httpx.HTTPError: If the API request fails
        """
        customer = {
            "name": customer_name,
            "number": phone
        }

        assistant_overrides = {
            "variableValues": {
                "customer_name": customer_name,
                "service_advisor_name": service_advisor_name,
                "service_type": service_type,
                "organization_name": organization_name,
                "location": location
            }
        }

        if google_review_link:
            assistant_overrides["variableValues"]["google_review_link"] = google_review_link

        if call_id:
            assistant_overrides["variableValues"]["call_id"] = str(call_id)

        payload = {
            "assistantId": settings.SURVEY_ASSISTANT_ID,
            "phoneNumberId": settings.PHONE_NUMBER_ID,
            "customer": customer,
            "assistantOverrides": assistant_overrides,
            "name": f"Calling {customer_name}"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/call",
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"VAPI API error: {str(e)}")
            logger.error(f"Request payload: {payload}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            raise 