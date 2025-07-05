"""
Call service.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID
import logging

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, Campaign, ServiceRecord, User
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
        Get call with related information.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict: Call with related information
            
        Raises:
            HTTPException: If call not found
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
            "direction": call.direction,
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
                call_dict["positive_mentions"] = service_record.positive_mentions
                call_dict["areas_to_improve"] = service_record.areas_to_improve
        
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
        db: AsyncSession = None
    ) -> Call:
        """
        Create a demo call entry.
        
        Args:
            demo_data: Demo call data
            db: Database session
            
        Returns:
            Call: Created call
        """
        # Create a service record for the demo call
        service_record = ServiceRecord(
            organization_id=demo_data.organization_id,
            customer_name=demo_data.customer_name,
            customer_phone=demo_data.phone_number,
            vehicle_info=demo_data.vehicle_number,
            status="Ready",
            service_type="Demo"
        )
        
        db.add(service_record)
        await db.flush()  # Flush to get service_record.id
        
        # Create the call record
        call = Call(
            organization_id=demo_data.organization_id,
            service_record_id=service_record.id,
            customer_number=demo_data.phone_number,
            direction="outbound",
            status="Scheduled",
            call_reason="Demo Call"
        )
        
        if demo_data.campaign_id:
            call.campaign_id = demo_data.campaign_id
            service_record.campaign_id = demo_data.campaign_id
        
        db.add(call)
        await db.commit()
        await db.refresh(call)
        
        return call

    @staticmethod
    async def initiate_demo_call(
        call_id: int,
        organization_id: UUID,
        db: AsyncSession = None
    ) -> Call:
        """
        Initiate a demo call.
        
        Args:
            call_id: Call ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Call: Updated call
        """
        # Get the call
        query = select(Call).where(
            and_(
                Call.id == call_id,
                Call.organization_id == organization_id
            )
        )
        result = await db.execute(query)
        call = result.scalars().first()
        
        if not call:
            raise ValueError(f"Call with ID {call_id} not found")
        
        # Update call status
        call.status = "In Progress"
        await db.commit()
        await db.refresh(call)
        
        # In a real implementation, this would trigger the actual call
        # For now, this is just updating the status
        
        return call

    @staticmethod
    async def list_calls_by_status(
        organization_id: UUID,
        status: str,
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = None
    ) -> List[Call]:
        """
        List calls by status.
        
        Args:
            organization_id: Organization ID
            status: Call status (Ready, Completed, Failed, Missed)
            skip: Number of calls to skip
            limit: Maximum number of calls to return
            db: Database session
            
        Returns:
            List[Call]: List of calls with the specified status
        """
        if status.lower() == "ready":
            # Ready for call status
            query = select(Call).where(
                and_(
                    Call.organization_id == organization_id,
                    Call.status == "Scheduled"
                )
            )
        elif status.lower() == "missed":
            # Missed calls include both Failed and Missed status
            query = select(Call).where(
                and_(
                    Call.organization_id == organization_id,
                    Call.status.in_(["Failed", "Missed"])
                )
            )
        elif status.lower() == "completed":
            # Completed calls
            query = select(Call).where(
                and_(
                    Call.organization_id == organization_id,
                    Call.status == "Completed"
                )
            )
        else:
            # Invalid status
            return []
        
        # Add order by and pagination
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
        try:
            logging.info(f"Starting bulk upload for campaign: {campaign_name}")
            logging.info(f"Total calls to process: {len(calls_data)}")
            
            # Create or get campaign
            campaign_query = select(Campaign).where(
                Campaign.name == campaign_name,
                Campaign.organization_id == organization_id
            )
            result = await db.execute(campaign_query)
            campaign = result.scalar_one_or_none()
            
            if not campaign:
                logging.info(f"Creating new campaign: {campaign_name}")
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
                logging.info(f"New campaign created with ID: {campaign.id}")
            else:
                logging.info(f"Found existing campaign with ID: {campaign.id}")
            
            # Process calls
            successful_calls = 0
            failed_calls = 0
            errors = []
            
            for i, call_data in enumerate(calls_data):
                try:
                    logging.info(f"Processing call {i+1}/{len(calls_data)}")
                    logging.debug(f"Call data: {call_data}")
                    
                    # Validate required fields
                    customer_number = call_data.get("customer_number")
                    if not customer_number:
                        logging.warning(f"Missing customer number in row {i+1}")
                        failed_calls += 1
                        errors.append(f"Missing customer number in row {i+1}")
                        continue
                        
                    # Validate phone number format
                    if not customer_number.startswith("+"):
                        customer_number = f"+{customer_number}"
                        logging.info(f"Added + prefix to phone number: {customer_number}")
                    
                    # Create call
                    logging.info(f"Creating call with customer number: {customer_number}")
                    call = Call(
                        organization_id=organization_id,
                        customer_number=customer_number,
                        call_reason=call_data.get("call_reason", "Follow-up call"),
                        status="Ready",  # Set status to Ready instead of Scheduled
                        direction="outbound",
                        campaign_id=campaign.id
                    )
                    
                    # Add service record if we have vehicle info
                    service_record_id = None
                    if call_data.get("vehicle_info") or call_data.get("service_type"):
                        try:
                            logging.info("Creating service record")
                            vehicle_info = call_data.get("vehicle_info", "")
                            service_type = call_data.get("service_type", "")
                            customer_name = call_data.get("customer_name", "")
                            service_advisor = call_data.get("service_advisor_name", "")
                            
                            logging.info(f"Service record data: vehicle={vehicle_info}, type={service_type}")
                            
                            service_record = ServiceRecord(
                                organization_id=organization_id,
                                customer_name=customer_name,
                                vehicle_info=vehicle_info,
                                service_type=service_type,
                                service_advisor=service_advisor,
                                status="Active",
                                campaign_id=campaign.id
                            )
                            db.add(service_record)
                            await db.flush()
                            service_record_id = service_record.id
                            logging.info(f"Service record created with ID: {service_record_id}")
                        except Exception as sr_error:
                            logging.error(f"Error creating service record: {str(sr_error)}")
                            # Don't fail the whole call, just continue without service record
                    
                    if service_record_id:
                        call.service_record_id = service_record_id
                    
                    logging.info("Adding call to session")
                    db.add(call)
                    successful_calls += 1
                    logging.info(f"Successfully processed call {i+1}")
                    
                except Exception as e:
                    failed_calls += 1
                    error_msg = f"Error processing row {i+1}: {str(e)}"
                    logging.error(error_msg)
                    errors.append(error_msg)
            
            # Commit all changes
            logging.info("Committing changes to database")
            await db.commit()
            logging.info(f"Bulk upload completed: {successful_calls} successful, {failed_calls} failed")
            
            return {
                "campaign_id": campaign.id,
                "campaign_name": campaign_name,
                "successful_calls": successful_calls,
                "failed_calls": failed_calls,
                "errors": errors[:10]  # Return only first 10 errors
            }
        except Exception as e:
            # Log the full error
            logging.error(f"Error in bulk_upload_calls: {str(e)}")
            logging.error(f"Error type: {type(e)}")
            import traceback
            logging.error(f"Traceback: {traceback.format_exc()}")
            await db.rollback()
            raise
    
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
            "service_advisor_name"
        ]
        
        sample_row = [
            "John Doe",
            "+19029897685",
            "2019 Honda Civic",
            "Oil Change",
            "Service follow-up",
            "Mike Smith"
        ]
        
        return {
            "headers": headers,
            "sample_row": sample_row
        } 