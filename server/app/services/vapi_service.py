"""
VAPI service for making calls using the VAPI API.
"""

from typing import Dict, Any, Optional
import logging
import httpx
from fastapi import Depends

from app.core.config import settings

logger = logging.getLogger(__name__)

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
        google_review_link: Optional[str] = None,
        call_id: Optional[int] = None
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
            "assistantId": settings.VAPI_ASSISTANT_ID,
            "phoneNumberId": settings.VAPI_PHONE_NUMBER_ID,
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

    async def create_demo_call(
        self,
        phone: str,
        customer_name: str,
        vehicle_info: str,
        service_advisor_name: str = "Demo Advisor",
        service_type: str = "Feedback Call",
        organization_name: str = "Demo Organization",
        location: str = "Demo Location",
        google_review_link: Optional[str] = None,
        call_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a demo call using VAPI's API.
        
        Args:
            phone: Customer phone number
            customer_name: Name of the customer
            vehicle_info: Vehicle information
            service_advisor_name: Name of the service advisor
            service_type: Type of service
            organization_name: Name of the organization
            location: Location of the organization
            call_id: Call ID for webhook identification
            
        Returns:
            VAPI API response
        """
        customer = {
            "name": customer_name,
            "number": phone
        }

        assistant_overrides = {
            "variableValues": {
                "customer_name": customer_name,
                "customer_phone": phone,
                "vehicle_info": vehicle_info,
                "service_advisor_name": service_advisor_name,
                "service_type": service_type,
                "organization_name": organization_name,
                "location": location,
                "is_demo": "true"
            }
        }

        if google_review_link:
            assistant_overrides["variableValues"]["google_review_link"] = google_review_link

        if call_id:
            assistant_overrides["variableValues"]["call_id"] = str(call_id)

        payload = {
            "assistantId": settings.VAPI_DEMO_ASSISTANT_ID,
            "phoneNumberId": settings.VAPI_PHONE_NUMBER_ID,
            "customer": customer,
            "assistantOverrides": assistant_overrides,
            "name": f"Demo Call: {customer_name}"
        }

        try:
            logger.info(f"Making VAPI demo call request with payload: {payload}")
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