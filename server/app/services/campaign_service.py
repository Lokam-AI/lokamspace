"""
Campaign service.
"""

from datetime import datetime, timedelta, timezone
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
from app.schemas.campaign import CampaignCreate, CampaignUpdate


class CampaignService:
    """Service for campaign operations."""
    
    @staticmethod
    async def get_campaign(
        db: AsyncSession,
        campaign_id: int,
        organization_id: UUID) -> Campaign:
        """
        Get campaign by ID within an organization.
        
        Args:
            campaign_id: Campaign ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Campaign: Campaign with given ID
            
        Raises:
            HTTPException: If campaign not found
        """
        result = await db.execute(
            select(Campaign).where(
                Campaign.id == campaign_id,
                Campaign.organization_id == organization_id
            )
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
            
        return campaign
    
    @staticmethod
    async def list_campaigns(
        db: AsyncSession,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[Campaign]:
        """
        List campaigns in an organization.
        
        Args:
            db: Database session
            organization_id: Organization ID
            skip: Number of campaigns to skip
            limit: Maximum number of campaigns to return
            status: Filter by campaign status
            
        Returns:
            List[Campaign]: List of campaigns
        """
        # Build query
        query = select(Campaign).where(Campaign.organization_id == organization_id)
        
        # Apply status filter if provided
        if status:
            query = query.where(Campaign.status == status)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        
        return list(result.scalars().all())
    
    @staticmethod
    async def create_campaign(
        db: AsyncSession,
        campaign_data: CampaignCreate) -> Campaign:
        """
        Create a new campaign.
        
        Args:
            campaign_data: Campaign creation data
            db: Database session
            
        Returns:
            Campaign: Created campaign
        """
        # Create campaign
        campaign = Campaign(**campaign_data.model_dump())
        
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
        
        return campaign
    
    @staticmethod
    async def update_campaign(
        db: AsyncSession,
        campaign_id: int,
        organization_id: UUID,
        campaign_data: CampaignUpdate) -> Campaign:
        """
        Update campaign.
        
        Args:
            campaign_id: Campaign ID
            organization_id: Organization ID
            campaign_data: Updated campaign data
            db: Database session
            
        Returns:
            Campaign: Updated campaign
            
        Raises:
            HTTPException: If campaign not found
        """
        # Get campaign
        campaign = await CampaignService.get_campaign(campaign_id, organization_id, db)
        
        # Update campaign fields
        update_data = campaign_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(campaign, field, value)
        
        # Save changes
        await db.commit()
        await db.refresh(campaign)
        
        return campaign
    
    @staticmethod
    async def delete_campaign(
        db: AsyncSession,
        campaign_id: int,
        organization_id: UUID) -> None:
        """
        Delete campaign.
        
        Args:
            campaign_id: Campaign ID
            organization_id: Organization ID
            db: Database session
            
        Raises:
            HTTPException: If campaign not found or has associated calls/records
        """
        # Get campaign
        campaign = await CampaignService.get_campaign(campaign_id, organization_id, db)
        
        # Check if campaign has associated calls
        calls_query = select(func.count()).where(
            Call.campaign_id == campaign_id
        )
        calls_result = await db.execute(calls_query)
        calls_count = calls_result.scalar_one_or_none() or 0
        
        if calls_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete campaign with {calls_count} associated calls"
            )
        
        # Check if campaign has associated service records
        records_query = select(func.count()).where(
            ServiceRecord.campaign_id == campaign_id
        )
        records_result = await db.execute(records_query)
        records_count = records_result.scalar_one_or_none() or 0
        
        if records_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete campaign with {records_count} associated service records"
            )
        
        # Delete campaign
        await db.delete(campaign)
        await db.commit()
    
    @staticmethod
    async def get_campaign_stats(
        campaign_id: int,
        organization_id: UUID,
        db: AsyncSession) -> Dict:
        """
        Get campaign statistics.
        
        Args:
            campaign_id: Campaign ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict: Campaign statistics
            
        Raises:
            HTTPException: If campaign not found
        """
        # Get campaign
        campaign = await CampaignService.get_campaign(db, campaign_id, organization_id)
        
        # Query total calls
        calls_query = select(func.count()).where(
            Call.campaign_id == campaign_id
        )
        calls_result = await db.execute(calls_query)
        total_calls = calls_result.scalar_one_or_none() or 0
        
        # Query completed calls
        completed_calls_query = select(func.count()).where(
            Call.campaign_id == campaign_id,
            Call.status == "Completed"
        )
        completed_calls_result = await db.execute(completed_calls_query)
        completed_calls = completed_calls_result.scalar_one_or_none() or 0
        
        # Query service records
        service_records_query = select(func.count()).where(
            ServiceRecord.campaign_id == campaign_id
        )
        service_records_result = await db.execute(service_records_query)
        total_service_records = service_records_result.scalar_one_or_none() or 0
        
        # Calculate completion rate
        completion_rate = (completed_calls / total_calls) * 100 if total_calls > 0 else 0
        
        # Calculate days active
        days_active = 0
        if campaign.created_at:
            days_active = (datetime.now(timezone.utc) - campaign.created_at).days
        
        return {
            "total_calls": total_calls,
            "completed_calls": completed_calls,
            "completion_rate": round(completion_rate, 2),
            "total_service_records": total_service_records,
            "days_active": days_active
        } 