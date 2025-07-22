"""
Campaign API endpoints.
"""

from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_admin_user, get_current_organization, get_current_user, get_tenant_db
from app.models import Campaign, Organization, User
from app.schemas import CampaignCreate, CampaignResponse, CampaignUpdate
from app.services.campaign_service import CampaignService

router = APIRouter()


@router.get("/", response_model=List[CampaignResponse])
async def list_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by campaign status"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List campaigns.
    
    Args:
        skip: Number of campaigns to skip
        limit: Maximum number of campaigns to return
        status: Filter by campaign status
        organization: Current organization
        db: Database session
        
    Returns:
        List[CampaignResponse]: List of campaigns
    """
    campaigns = await CampaignService.list_campaigns(
        organization_id=organization.id,
        skip=skip,
        limit=limit,
        status=status,
        db=db
    )
    
    # Enhance campaigns with additional info
    result = []
    for campaign in campaigns:
        stats = await CampaignService.get_campaign_stats(
            campaign_id=campaign.id,
            organization_id=organization.id,
            db=db
        )
        
        campaign_dict = CampaignResponse.model_validate(campaign).model_dump()
        campaign_dict["completion_rate"] = stats.get("completion_rate", 0)
        campaign_dict["call_count"] = stats.get("total_calls", 0)
        
        result.append(CampaignResponse(**campaign_dict))
    
    return result


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a new campaign.
    
    Args:
        campaign_data: Campaign data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CampaignResponse: Created campaign
    """
    # Ensure organization ID matches
    if campaign_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    campaign = await CampaignService.create_campaign(campaign_data, db)
    
    return campaign


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get campaign by ID.
    
    Args:
        campaign_id: Campaign ID
        organization: Current organization
        db: Database session
        
    Returns:
        CampaignResponse: Campaign details
    """
    campaign = await CampaignService.get_campaign(
        campaign_id=campaign_id,
        organization_id=organization.id,
        db=db
    )
    
    # Get campaign stats
    stats = await CampaignService.get_campaign_stats(
        campaign_id=campaign_id,
        organization_id=organization.id,
        db=db
    )
    
    # Combine campaign data with stats
    campaign_dict = CampaignResponse.model_validate(campaign).model_dump()
    campaign_dict["completion_rate"] = stats.get("completion_rate", 0)
    campaign_dict["call_count"] = stats.get("total_calls", 0)
    
    return CampaignResponse(**campaign_dict)


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_data: CampaignUpdate,
    campaign_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update campaign.
    
    Args:
        campaign_data: Updated campaign data
        campaign_id: Campaign ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CampaignResponse: Updated campaign
    """
    campaign = await CampaignService.update_campaign(
        campaign_id=campaign_id,
        organization_id=organization.id,
        campaign_data=campaign_data,
        db=db
    )
    
    # Get campaign stats
    stats = await CampaignService.get_campaign_stats(
        campaign_id=campaign_id,
        organization_id=organization.id,
        db=db
    )
    
    # Combine campaign data with stats
    campaign_dict = CampaignResponse.model_validate(campaign).model_dump()
    campaign_dict["completion_rate"] = stats.get("completion_rate", 0)
    campaign_dict["call_count"] = stats.get("total_calls", 0)
    
    return CampaignResponse(**campaign_dict)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete campaign.
    
    Args:
        campaign_id: Campaign ID
        organization: Current organization
        current_user: Current authenticated user (admin only)
        db: Database session
    """
    await CampaignService.delete_campaign(
        campaign_id=campaign_id,
        organization_id=organization.id,
        db=db
    )


@router.get("/{campaign_id}/stats", response_model=dict)
async def get_campaign_stats(
    campaign_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get campaign statistics.
    
    Args:
        campaign_id: Campaign ID
        organization: Current organization
        db: Database session
        
    Returns:
        dict: Campaign statistics
    """
    return await CampaignService.get_campaign_stats(
        campaign_id=campaign_id,
        organization_id=organization.id,
        db=db
    ) 