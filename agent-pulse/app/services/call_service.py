from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.models.database import Call, Organization, ServiceRecord, CampaignStatus, ServiceStatus
from app.services.vapi_service import VAPIService

logger = get_logger(__name__)

class CallService:
    """Service for managing call operations."""
    
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.vapi_service = VAPIService()
    
    async def initiate_next_pending_call(self, phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiate the earliest pending call.
        
        Args:
            phone_number: Optional phone number to use for the call
            
        Returns:
            Dict containing call initiation result
        """
        # Get the earliest pending call
        query = select(Call).where(
            Call.status == CampaignStatus.PENDING
        ).order_by(Call.created_at.asc()).limit(1)
        
        result = await self.db_session.execute(query)
        call = result.scalar_one_or_none()
        
        if not call:
            raise ValueError("No pending calls found")
        
        return await self._initiate_call(call, phone_number)
    
    async def initiate_specific_call(self, call_id: int, phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiate a call for a specific call_id.
        
        Args:
            call_id: The ID of the call to initiate
            phone_number: Optional phone number to use for the call
            
        Returns:
            Dict containing call initiation result
        """
        # Get the specific call by ID
        query = select(Call).where(Call.id == call_id)
        result = await self.db_session.execute(query)
        call = result.scalar_one_or_none()
        
        if not call:
            raise ValueError(f"Call with ID {call_id} not found")
        
        # # Check if call is in a valid state to initiate
        # if call.status not in [CampaignStatus.PENDING, CampaignStatus.FAILED, CampaignStatus.COMPLETED]:
        #     raise ValueError(f"Call {call_id} is in {call.status.value} status and cannot be initiated")
        
        return await self._initiate_call(call, phone_number)
    
    async def _initiate_call(self, call: Call, phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Internal method to initiate a call.
        
        Args:
            call: The call record to initiate
            phone_number: Optional phone number to use for the call
            
        Returns:
            Dict containing call initiation result
        """
        # Get organization and service record details
        org_query = select(Organization).where(Organization.id == call.organization_id)
        service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
        
        org_result = await self.db_session.execute(org_query)
        service_result = await self.db_session.execute(service_query)
        
        organization = org_result.scalar_one_or_none()
        service_record = service_result.scalar_one_or_none()
        
        if not organization or not service_record:
            raise ValueError("Organization or service record not found")
        
        # Determine which phone number to use
        # Priority: 1. Provided phone_number, 2. Service record phone, 3. Hardcoded fallback
        call_phone = phone_number or service_record.phone or "+19029897685"
        
        try:
            # Initiate call with VAPI
            call_response = await self.vapi_service.create_call(
                phone=call_phone,
                customer_name=service_record.customer_name,
                service_advisor_name=service_record.service_advisor_name,
                service_type=service_record.service_type,
                organization_name=organization.name,
                location=organization.location,
                google_review_link=organization.google_review_link,
                call_id=call.id
            )
            
            # Update call and service record status
            call.status = CampaignStatus.IN_PROGRESS
            call.call_started_at = datetime.utcnow()
            service_record.status = ServiceStatus.IN_PROGRESS
            await self.db_session.commit()
            
            return {
                "message": "Call initiated successfully",
                "call_id": call.id,
                "service_record_id": call.service_record_id,
                "customer_name": service_record.customer_name,
                "service_type": service_record.service_type,
                "vapi_response": call_response
            }
            
        except Exception as e:
            # Update call and service record status to failed
            call.status = CampaignStatus.FAILED
            service_record.status = ServiceStatus.FAILED
            await self.db_session.commit()
            logger.error(f"Error initiating call {call.id}: {str(e)}")
            raise 