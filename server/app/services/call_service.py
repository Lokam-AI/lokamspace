"""
Call service.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, Campaign, ServiceRecord, User


class CallService:
    """Service for call operations."""
    
    @staticmethod
    async def get_call(
        db: AsyncSession,
        call_id: int,
        organization_id: UUID) -> Call:
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
        db: AsyncSession,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        campaign_id: Optional[int] = None,
        agent_id: Optional[int] = None,
        direction: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Call]:
        """
        List calls in an organization with filtering options.
        
        Args:
            db: Database session
            organization_id: Organization ID
            skip: Number of calls to skip
            limit: Maximum number of calls to return
            status: Filter by call status
            campaign_id: Filter by campaign ID
            agent_id: Filter by agent ID
            direction: Filter by call direction (inbound/outbound)
            start_date: Filter by start date (inclusive)
            end_date: Filter by end date (inclusive)
            
        Returns:
            List[Call]: List of calls
        """
        # Build base query
        query = select(Call).where(Call.organization_id == organization_id)
        
        # Apply filters
        if status:
            query = query.where(Call.status == status)
            
        if campaign_id:
            query = query.where(Call.campaign_id == campaign_id)
            
        if agent_id:
            query = query.where(Call.agent_id == agent_id)
            
        if direction:
            query = query.where(Call.direction == direction)
            
        if start_date:
            query = query.where(Call.start_time >= start_date)
            
        if end_date:
            # Add one day to include the end date fully
            end_date_inclusive = end_date + timedelta(days=1)
            query = query.where(Call.start_time < end_date_inclusive)
        
        # Apply pagination
        query = query.order_by(Call.start_time.desc()).offset(skip).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        
        return list(result.scalars().all())
    
    @staticmethod
    async def create_call(
        db: AsyncSession,
        call_data: Dict,
        organization_id: UUID) -> Call:
        """
        Create a new call record.
        
        Args:
            call_data: Call creation data
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Call: Created call
        """
        # Create call
        call = Call(
            organization_id=organization_id,
            **call_data
        )
        
        db.add(call)
        await db.commit()
        await db.refresh(call)
        
        return call
    
    @staticmethod
    async def update_call(
        db: AsyncSession,
        call_id: int,
        organization_id: UUID,
        call_data: Dict) -> Call:
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
        for field, value in call_data.items():
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
        db: AsyncSession,
        call_id: int,
        organization_id: UUID) -> None:
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