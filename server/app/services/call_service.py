"""
Call service implementation.

This module provides services for handling calls.
"""

from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Any
from uuid import UUID
import logging

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
try:
    from sqlalchemy.orm import joinedload
except ImportError:
    # Handle the case where the import fails
    # This is a workaround for the linter issue
    joinedload = lambda x: x  # type: ignore

from app.models import Call, Campaign, ServiceRecord, User, Transcript, CallFeedback
from app.schemas.call import CallCreate, CallUpdate
from app.schemas.demo_call import DemoCallCreate


class CallService:
    """Service for call operations."""
    
    @staticmethod
    async def get_call(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession) -> Call:
        """
        Get call by ID within an organization.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Call: Call with given ID
            
        Raises:
            HTTPException: If call not found
        """
        result = await db.execute(
            select(Call).where(
                Call.id == call_id,
                Call.organization_id == organization_id
            )
        )
        call = result.scalar_one_or_none()
        
        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call not found"
            )
            
        return call
    
    @staticmethod
    async def list_calls(
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        call_type: Optional[str] = None,
        service_record_id: Optional[int] = None,
        campaign_id: Optional[int] = None,
        db: AsyncSession = None,
    ) -> List[Call]:
        """
        List calls with filters.
        
        Args:
            organization_id: Organization ID
            skip: Number of calls to skip
            limit: Maximum number of calls to return
            status: Filter by call status
            call_type: Filter by call type
            service_record_id: Filter by service record ID
            campaign_id: Filter by campaign ID
            db: Database session
            
        Returns:
            List[Call]: List of calls
        """
        query = select(Call).where(Call.organization_id == organization_id)
        
        if status:
            query = query.where(Call.status == status)
        
        if call_type:
            query = query.where(Call.direction == call_type)
        
        if service_record_id:
            query = query.where(Call.service_record_id == service_record_id)
        
        if campaign_id:
            # Either the call is directly linked to the campaign or
            # its service record is linked to the campaign
            query = query.join(ServiceRecord).where(
                or_(
                    ServiceRecord.campaign_id == campaign_id,
                    Call.campaign_id == campaign_id
                )
            )
        
        # Add order by and pagination
        query = query.order_by(Call.created_at.desc())
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def create_call(
        call_data: CallCreate,
        db: AsyncSession) -> Call:
        """
        Create a new call record.
        
        Args:
            call_data: Call creation data
            db: Database session
            
        Returns:
            Call: Created call
        """
        # Create call
        call = Call(**call_data.dict())
        
        db.add(call)
        await db.commit()
        await db.refresh(call)
        
        return call
    
    @staticmethod
    async def update_call(
        call_id: int,
        organization_id: UUID,
        call_data: CallUpdate,
        db: AsyncSession) -> Call:
        """
        Update call record.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            call_data: Updated call data
            db: Database session
            
        Returns:
            Call: Updated call
            
        Raises:
            HTTPException: If call not found
        """
        # Get call
        call = await CallService.get_call(call_id, organization_id, db)
        
        # Update call fields
        update_data = call_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(call, field, value)
        
        # Calculate duration if start and end time are available
        if call.start_time and call.end_time:
            duration = (call.end_time - call.start_time).total_seconds()
            call.duration_sec = int(duration)
        
        # Save changes
        await db.commit()
        await db.refresh(call)
        
        return call
    
    @staticmethod
    async def delete_call(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession) -> None:
        """
        Delete call record.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Raises:
            HTTPException: If call not found
        """
        # Get call
        call = await CallService.get_call(call_id, organization_id, db)
        
        # Delete call
        await db.delete(call)
        await db.commit()
    
    @staticmethod
    async def get_call_with_related_info(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession) -> Dict:
        """
        Get call with related information (service record, campaign).
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict: Call data with related information
        """
        # Get call
        call = await CallService.get_call(call_id, organization_id, db)
        
        # Convert to dict
        call_dict = {
            "id": call.id,
            "organization_id": call.organization_id,
            "service_record_id": call.service_record_id,
            "campaign_id": call.campaign_id,
            "customer_number": call.customer_number,
            "phone_number": call.customer_number,  # Map customer_number to phone_number for schema compatibility
            "direction": call.direction,
            "call_type": call.direction.capitalize(),  # Map direction to call_type for schema compatibility
            "start_time": call.start_time,
            "end_time": call.end_time,
            "duration_sec": call.duration_sec,
            "status": call.status,
            "recording_url": call.recording_url,
            "nps_score": call.nps_score,
            "call_reason": call.call_reason,
            "feedback_summary": call.feedback_summary,
            "created_at": call.created_at,
            "updated_at": call.updated_at
        }
        
        # Add service record info if available
        if call.service_record_id:
            service_record = await db.get(ServiceRecord, call.service_record_id)
            if service_record:
                call_dict["customer_name"] = service_record.customer_name
                call_dict["vehicle_info"] = service_record.vehicle_info
                call_dict["service_advisor_name"] = service_record.service_advisor_name
                call_dict["service_type"] = service_record.service_type
                call_dict["appointment_date"] = service_record.appointment_date
                call_dict["is_demo"] = service_record.is_demo
                
        # Add campaign info if available
        if call.campaign_id:
            campaign = await db.get(Campaign, call.campaign_id)
            if campaign:
                call_dict["campaign_name"] = campaign.name
        
        return call_dict
        
    @staticmethod
    async def validate_service_record(
        service_record_id: int,
        organization_id: UUID,
        db: AsyncSession) -> bool:
        """
        Validate that a service record exists and belongs to the organization.
        
        Args:
            service_record_id: Service record ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            bool: True if valid, False otherwise
        """
        result = await db.execute(
            select(ServiceRecord).where(
                ServiceRecord.id == service_record_id,
                ServiceRecord.organization_id == organization_id
            )
        )
        return result.scalar_one_or_none() is not None
    
    @staticmethod
    async def validate_campaign(
        campaign_id: int,
        organization_id: UUID,
        db: AsyncSession) -> bool:
        """
        Validate that a campaign exists and belongs to the organization.
        
        Args:
            campaign_id: Campaign ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            bool: True if valid, False otherwise
        """
        result = await db.execute(
            select(Campaign).where(
                Campaign.id == campaign_id,
                Campaign.organization_id == organization_id
            )
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_call_stats(
        db: AsyncSession,
        organization_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        campaign_id: Optional[int] = None
    ) -> Dict:
        """
        Get call statistics.
        
        Args:
            db: Database session
            organization_id: Organization ID
            start_date: Start date for stats (inclusive)
            end_date: End date for stats (inclusive)
            campaign_id: Filter by campaign ID
            
        Returns:
            Dict: Call statistics
        """
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.utcnow()
            
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Build base query conditions
        conditions = [Call.organization_id == organization_id]
        
        # Add date range conditions
        conditions.append(Call.start_time >= start_date)
        conditions.append(Call.start_time <= end_date + timedelta(days=1))
        
        # Add campaign filter if provided
        if campaign_id:
            conditions.append(Call.campaign_id == campaign_id)
        
        # Query total calls
        total_query = select(func.count()).where(and_(*conditions))
        total_result = await db.execute(total_query)
        total_calls = total_result.scalar_one_or_none() or 0
        
        # Query completed calls
        completed_conditions = conditions + [Call.status == "Completed"]
        completed_query = select(func.count()).where(and_(*completed_conditions))
        completed_result = await db.execute(completed_query)
        completed_calls = completed_result.scalar_one_or_none() or 0
        
        # Query average duration
        duration_query = select(func.avg(Call.duration_sec)).where(and_(*conditions))
        duration_result = await db.execute(duration_query)
        avg_duration = duration_result.scalar_one_or_none() or 0
        
        # Calculate completion rate
        completion_rate = (completed_calls / total_calls * 100) if total_calls > 0 else 0
        
        return {
            "total_calls": total_calls,
            "completed_calls": completed_calls,
            "completion_rate": round(completion_rate, 2),
            "average_duration_sec": round(avg_duration, 2)
        }

    @staticmethod
    async def create_demo_call(
        demo_data: DemoCallCreate,
        current_user_id: int,
        db: AsyncSession = None
    ) -> Call:
        """
        Create a demo call entry.
        
        Args:
            demo_data: Demo call data
            current_user_id: ID of the current user
            db: Database session
            
        Returns:
            Call: Created call
        """
        # Create or get 'Demo Campaign'
        campaign_query = select(Campaign).where(
            and_(
                Campaign.name == "Demo Campaign",
                Campaign.organization_id == demo_data.organization_id
            )
        )
        result = await db.execute(campaign_query)
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            # Create new demo campaign
            campaign = Campaign(  # type: ignore
                name="Demo Campaign",
                organization_id=demo_data.organization_id,
                status="Active",
                created_by=current_user_id,
                modified_by=current_user_id
            )
            db.add(campaign)
            await db.flush()
        
        # Use today's date for the appointment if not provided
        appointment_date = demo_data.appointment_date if hasattr(demo_data, 'appointment_date') and demo_data.appointment_date else datetime.utcnow()
        
        # Create a service record for the demo call
        service_record = ServiceRecord(  # type: ignore
            organization_id=demo_data.organization_id,
            customer_name=demo_data.customer_name,
            customer_phone=demo_data.phone_number,
            vehicle_info=demo_data.vehicle_number,
            status="Ready",
            service_type=demo_data.service_type or "Oil Change",
            service_advisor_name=demo_data.service_advisor_name or "Demo Advisor",
            campaign_id=campaign.id,
            is_demo=True,  # Set is_demo flag to True on ServiceRecord
            appointment_date=appointment_date  # Use provided date or today's date
        )
        
        db.add(service_record)
        await db.flush()  # Flush to get service_record.id
        
        # Create the call record
        call = Call(  # type: ignore
            organization_id=demo_data.organization_id,
            service_record_id=service_record.id,
            customer_number=demo_data.phone_number,
            direction="outbound",
            status="Ready",  # Set status to Ready instead of Scheduled
            call_reason="Demo Call",
            campaign_id=campaign.id
        )
        
        db.add(call)
        await db.commit()
        await db.refresh(call)
        
        return call

    @staticmethod
    async def initiate_demo_call(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession = None
    ) -> Dict:
        """
        Initiate a demo call using VAPI service.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict: Dictionary with call details and VAPI response
        """
        from app.services.vapi_service import VAPIService
        from app.models import Organization

        # Get the call and associated data
        query = select(Call).where(
            and_(
                Call.id == call_id,
                Call.organization_id == organization_id
            )
        )
        result = await db.execute(query)
        call = result.scalar_one_or_none()
        
        if not call:
            raise ValueError(f"Call with ID {call_id} not found")
            
        # Get service record
        service_query = select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
        service_result = await db.execute(service_query)
        service_record = service_result.scalar_one_or_none()
        
        if not service_record:
            raise ValueError(f"Service record for call ID {call_id} not found")
            
        # Get organization
        org_query = select(Organization).where(Organization.id == call.organization_id)
        org_result = await db.execute(org_query)
        organization = org_result.scalar_one_or_none()
        
        if not organization:
            raise ValueError(f"Organization for call ID {call_id} not found")
        
        # Initialize VAPI service
        vapi_service = VAPIService()
        
        try:
            # Make the call to VAPI
            vapi_response = await vapi_service.create_demo_call(
                phone=service_record.customer_phone,
                customer_name=service_record.customer_name,
                vehicle_info=service_record.vehicle_info or "Demo Vehicle",
                service_advisor_name=service_record.service_advisor_name or "Demo Advisor",
                service_type=service_record.service_type or "Feedback Call",
                organization_name=organization.name,
                location=organization.location or "Demo Location",
                call_id=call.id
            )
            
            # Update call status
            call.status = "In Progress"
            call.start_time = datetime.utcnow()
            await db.commit()
            await db.refresh(call)
            
            # Update service record status too
            service_record.status = "In Progress"
            await db.commit()
            
            # Return response with all necessary information
            return {
                "call_id": call.id,
                "service_record_id": service_record.id,
                "customer_name": service_record.customer_name,
                "customer_number": call.customer_number,
                "vehicle_info": service_record.vehicle_info,
                "campaign_id": call.campaign_id,
                "status": call.status,
                "appointment_date": service_record.appointment_date,
                "vapi_response": vapi_response
            }
            
        except Exception as e:
            # Update call and service record status to Failed if there's an error
            call.status = "Failed"
            service_record.status = "Failed"
            await db.commit()
            raise ValueError(f"Failed to initiate call with VAPI: {str(e)}")

    @staticmethod
    async def list_calls_by_status(
        organization_id: UUID,
        status: str,
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = None,
        service_advisor_name: Optional[str] = None,
        campaign_id: Optional[int] = None,
        search: Optional[str] = None,
        appointment_date: Optional[date] = None,
    ) -> List[Call]:
        """
        List calls by status, with optional filters.
        """
        options = [
            joinedload(Call.service_record)
        ]
        if status.lower() == "ready":
            query = select(Call).join(ServiceRecord).where(
                and_(
                    Call.organization_id == organization_id,
                    Call.status.in_(["Ready", "Scheduled"]),
                    ServiceRecord.is_demo == False
                )
            ).options(*options)
        elif status.lower() == "missed":
            query = select(Call).join(ServiceRecord).where(
                and_(
                    Call.organization_id == organization_id,
                    Call.status.in_(["Failed", "Missed"]),
                    ServiceRecord.is_demo == False
                )
            ).options(*options)
        elif status.lower() == "completed":
            query = select(Call).join(ServiceRecord).where(
                and_(
                    Call.organization_id == organization_id,
                    Call.status == "Completed",
                    ServiceRecord.is_demo == False
                )
            ).options(*options)
        elif status.lower() == "demo":
            query = select(Call).join(ServiceRecord).where(
                and_(
                    Call.organization_id == organization_id,
                    ServiceRecord.is_demo == True
                )
            ).options(*options)
        else:
            return []

        if service_advisor_name:
            query = query.where(ServiceRecord.service_advisor_name == service_advisor_name)
        if campaign_id:
            query = query.where(ServiceRecord.campaign_id == campaign_id)
        if search:
            query = query.where(ServiceRecord.customer_name.ilike(f"%{search}%"))
        if appointment_date:
            query = query.where(func.date(ServiceRecord.appointment_date) == appointment_date)

        query = query.order_by(Call.created_at.desc())
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def bulk_upload_calls(
        organization_id: UUID,
        campaign_name: str,
        calls_data: List[Dict],
        db: AsyncSession,
        current_user_id: int = None
    ) -> Dict:
        """
        Bulk upload calls from CSV data.
        
        Args:
            organization_id: Organization ID
            campaign_name: Name of the campaign for these calls
            calls_data: List of call data from CSV
            db: Database session
            current_user_id: ID of the user performing the upload
            
        Returns:
            Dict: Summary of the upload operation
        """
        # Create or get campaign
        campaign_query = select(Campaign).where(
            and_(
                Campaign.name == campaign_name,
                Campaign.organization_id == organization_id
            )
        )
        result = await db.execute(campaign_query)
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            # Create new campaign
            campaign = Campaign(
                name=campaign_name,
                organization_id=organization_id,
                status="Active",
                created_by=current_user_id,
                modified_by=current_user_id
            )
            db.add(campaign)
            await db.flush()
        
        # Process calls
        successful_calls = 0
        failed_calls = 0
        errors = []
        
        for i, call_data in enumerate(calls_data):
            try:
                # Validate required fields
                customer_number = call_data.get("customer_number")
                if not customer_number:
                    failed_calls += 1
                    errors.append(f"Missing customer number in row {i+1}")
                    continue
                
                # Validate phone number format
                if not customer_number.startswith("+1"):
                    customer_number = f"+1{customer_number}"

                print("Service Type: ", call_data.get("service_type", "Feedback Call"))
                
                # Parse appointment_date if provided
                appointment_date = None
                if appointment_date_str := call_data.get("appointment_date"):
                    try:
                        # Try to parse the date string into a datetime object
                        appointment_date = datetime.fromisoformat(appointment_date_str)
                    except ValueError:
                        try:
                            # Try alternative format MM/DD/YYYY
                            appointment_date = datetime.strptime(appointment_date_str, "%m/%d/%Y")
                        except ValueError:
                            errors.append(f"Invalid appointment date format in row {i+1}. Use YYYY-MM-DD or MM/DD/YYYY.")
                
                # Create service record
                service_record = ServiceRecord(
                    organization_id=organization_id,
                    customer_name=call_data.get("customer_name", ""),
                    customer_phone=customer_number,
                    vehicle_info=call_data.get("vehicle_info", ""),
                    service_type=call_data.get("service_type", "Feedback Call"),
                    service_advisor_name=call_data.get("service_advisor_name", ""),
                    status="Ready",
                    campaign_id=campaign.id,
                    is_demo=False,  # Ensure is_demo is False for bulk uploaded records
                    appointment_date=appointment_date
                )
                
                db.add(service_record)
                await db.flush()
                
                # Create call
                call = Call(
                    organization_id=organization_id,
                    service_record_id=service_record.id,
                    customer_number=customer_number,
                    call_reason=call_data.get("call_reason", "Feedback call"),
                    status="Ready",
                    direction="outbound",
                    campaign_id=campaign.id
                )
                
                db.add(call)
                successful_calls += 1
                
            except Exception as e:
                failed_calls += 1
                errors.append(f"Error processing row {i+1}: {str(e)}")
        
        await db.commit()
        
        return {
            "successful_calls": successful_calls,
            "failed_calls": failed_calls,
            "errors": errors
        }
    
    @staticmethod
    def get_csv_template() -> Dict:
        """
        Get CSV template for bulk call upload.
        
        Returns:
            Dict: CSV template with headers and sample row
        """
        headers = [
            "customer_name",
            "customer_number",
            "vehicle_info",
            "service_type",
            "call_reason",
            "service_advisor_name",
            "appointment_date"
        ]
        
        sample_row = [
            "John Doe",
            "+19029897685",
            "2019 Honda Civic",
            "Oil Change",
            "Service follow-up",
            "Mike Smith",
            "2023-06-01"
        ]
        
        return {
            "headers": headers,
            "sample_row": sample_row
        } 

    @staticmethod
    async def get_call_details(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Get detailed call information including service record and transcripts.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict[str, Any]: Detailed call information
        """
        # Query for call with service record
        query = (
            select(Call, ServiceRecord)
            .outerjoin(ServiceRecord, Call.service_record_id == ServiceRecord.id)
            .where(
                Call.id == call_id,
                Call.organization_id == organization_id
            )
        )
        result = await db.execute(query)
        call_service = result.first()
        
        if not call_service:
            raise HTTPException(status_code=404, detail="Call not found")
        
        call, service_record = call_service
        
        # Get transcripts
        transcript_query = select(Transcript).where(Transcript.call_id == call_id).order_by(Transcript.time)
        transcript_result = await db.execute(transcript_query)
        transcripts = transcript_result.scalars().all()
        
        # Format transcript segments
        transcript_segments = [
            {
                "role": t.role,
                "content": t.message,
                "timestamp": t.time
            }
            for t in transcripts
        ]
        
        # Calculate derived fields
        call_duration = None
        if call.start_time and call.end_time:
            duration = call.end_time - call.start_time
            call_duration = f"{duration.seconds // 60}:{duration.seconds % 60:02d}"
        
        # Get call feedback records
        feedback_query = select(CallFeedback).where(CallFeedback.call_id == call_id)
        feedback_result = await db.execute(feedback_query)
        feedback_records = feedback_result.scalars().all()
        
        # Extract positive mentions and detractors from call_feedback records
        positive_mentions = []
        areas_to_improve = []
        
        for feedback in feedback_records:
            if feedback.type == "positives" and feedback.kpis:
                # Ensure kpis is a list
                if isinstance(feedback.kpis, list):
                    positive_mentions = feedback.kpis
                elif isinstance(feedback.kpis, str):
                    # If it's a single string, convert to a list
                    positive_mentions = [feedback.kpis]
                else:
                    positive_mentions = []
            elif feedback.type == "detractors" and feedback.kpis:
                # Ensure kpis is a list
                if isinstance(feedback.kpis, list):
                    areas_to_improve = feedback.kpis
                elif isinstance(feedback.kpis, str):
                    # If it's a single string, convert to a list
                    areas_to_improve = [feedback.kpis]
                else:
                    areas_to_improve = []
        
        # Create tags dictionary for frontend
        tags = {
            "positives": positive_mentions if isinstance(positive_mentions, list) else [positive_mentions] if positive_mentions else [],
            "negatives": areas_to_improve if isinstance(areas_to_improve, list) else [areas_to_improve] if areas_to_improve else []
        }
        
        # Compile response data
        response_data = {
            "id": call.id,
            "customer_number": call.customer_number,
            "phone_number": call.customer_number,  # Map customer_number to phone_number for schema compatibility
            "direction": call.direction,
            "call_type": call.direction.capitalize(),  # Map direction to call_type for schema compatibility
            "start_time": call.start_time,
            "end_time": call.end_time,
            "duration_sec": call.duration_sec,
            "status": call.status,
            "recording_url": call.recording_url,
            "nps_score": call.nps_score,
            "call_reason": call.call_reason,
            "feedback_summary": call.feedback_summary,
            "call_summary": call.call_summary,
            "cost": call.cost,  # Include the cost field from the call model
            "customer_name": service_record.customer_name if service_record else None,
            "vehicle_info": service_record.vehicle_info if service_record else None,
            "service_type": service_record.service_type if service_record else None,
            "service_advisor_name": service_record.service_advisor_name if service_record else None,
            "positive_mentions": positive_mentions if isinstance(positive_mentions, list) else [positive_mentions] if positive_mentions else [],
            "areas_to_improve": areas_to_improve if isinstance(areas_to_improve, list) else [areas_to_improve] if areas_to_improve else [],
            "tags": tags,  # Add the tags dictionary
            "overall_feedback": call.feedback_summary,
            "appointment_date": service_record.appointment_date if service_record else None,  # Include appointment date
            "transcript": transcript_segments,
            "call_duration": call_duration,
            "attempt_count": 1,  # TODO: Calculate actual attempt count if needed
            "customer_email": None  # TODO: Add if available in models
        }
        
        return response_data

    @staticmethod
    async def schedule_call(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession
    ) -> None:
        """
        Schedule a call by updating its status to Scheduled.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
        """
        call = await CallService.get_call(call_id, organization_id, db)
        call.status = "Scheduled"
        await db.commit() 