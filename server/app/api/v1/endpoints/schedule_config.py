"""
Schedule configuration API endpoints.
"""

import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User
from app.schemas.schedule_config import ScheduleConfigCreate, ScheduleConfigResponse, ScheduleConfigUpdate
from app.services.schedule_config_service import ScheduleConfigService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=ScheduleConfigResponse)
async def get_schedule_config(
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get schedule configuration.
    
    Args:
        campaign_id: Optional campaign ID filter
        organization: Current organization
        db: Database session
        
    Returns:
        ScheduleConfigResponse: Schedule configuration
    """
    logger.info(f"GET schedule_config for org: {organization.id}, campaign: {campaign_id}")
    
    schedule_config = await ScheduleConfigService.get_organization_schedule_config(
        organization_id=organization.id,
        campaign_id=campaign_id,
        db=db
    )
    
    if not schedule_config:
        logger.info("No config found, returning default")
        # Return default configuration if none exists
        return ScheduleConfigResponse(
            id=0,
            organization_id=organization.id,
            campaign_id=campaign_id,
            start_time="09:00",
            end_time="17:00",
            timezone="America/New_York",
            active_days=["friday", "monday", "saturday", "thursday", "tuesday", "wednesday"],
            auto_call_enabled=True,
            created_at="",
            updated_at=""
        )
    
    # Convert from database config to response schema
    config_data = schedule_config.config_json
    logger.info(f"Found config: {schedule_config.id}, json: {config_data}")
    
    # Get active days and sort them for consistency
    active_days = config_data.get("active_days", ["monday", "tuesday", "wednesday", "thursday", "friday"])
    
    # Ensure we're using the actual values from the database
    response = ScheduleConfigResponse(
        id=schedule_config.id,
        organization_id=schedule_config.organization_id,
        campaign_id=schedule_config.campaign_id,
        start_time=config_data.get("start_time", "09:00"),
        end_time=config_data.get("end_time", "17:00"),
        timezone=config_data.get("timezone", "America/New_York"),
        active_days=active_days,
        auto_call_enabled=config_data.get("auto_call_enabled", True),
        created_at=schedule_config.created_at.isoformat() if hasattr(schedule_config, "created_at") else "",
        updated_at=schedule_config.updated_at.isoformat() if hasattr(schedule_config, "updated_at") else ""
    )
    
    logger.info(f"Returning response: {response}")
    return response


@router.put("/", response_model=ScheduleConfigResponse)
async def update_schedule_config(
    config_data: ScheduleConfigUpdate,
    campaign_id: Optional[int] = Query(None, description="Filter by campaign ID"),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update schedule configuration.
    
    Args:
        config_data: Updated configuration data
        campaign_id: Optional campaign ID filter
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ScheduleConfigResponse: Updated schedule configuration
    """
    logger.info(f"PUT schedule_config for org: {organization.id}, campaign: {campaign_id}")
    logger.info(f"Update data: {config_data.dict()}")
    
    # Get existing config first
    existing_config = await ScheduleConfigService.get_organization_schedule_config(
        organization_id=organization.id,
        campaign_id=campaign_id,
        db=db
    )
    
    # Prepare config data as dictionary
    config_dict = config_data.dict(exclude_unset=True)
    logger.info(f"Config dict after exclude_unset: {config_dict}")
    
    # Sort active_days if present
    if "active_days" in config_dict and config_dict["active_days"]:
        config_dict["active_days"] = sorted(config_dict["active_days"])
    
    if existing_config:
        logger.info(f"Updating existing config: {existing_config.id}")
        # Update existing config
        # Merge with existing config
        current_config = existing_config.config_json.copy()  # Make a copy to avoid reference issues
        logger.info(f"Current config before merge: {current_config}")
        
        # Update each field from the request
        for key, value in config_dict.items():
            if value is not None:
                current_config[key] = value
        
        logger.info(f"Merged config: {current_config}")
        
        # Update the config in the database
        updated_config = await ScheduleConfigService.update_schedule_config(
            organization_id=organization.id,
            config_data=current_config,
            campaign_id=campaign_id,
            db=db
        )
    else:
        logger.info("Creating new config")
        # Create new config
        # Set default values for missing fields
        if "start_time" not in config_dict:
            config_dict["start_time"] = "09:00"
        if "end_time" not in config_dict:
            config_dict["end_time"] = "17:00"
        if "timezone" not in config_dict:
            config_dict["timezone"] = "America/New_York"
        if "active_days" not in config_dict:
            config_dict["active_days"] = ["monday", "tuesday", "wednesday", "thursday", "friday"]
        else:
            # Sort active_days for consistency
            config_dict["active_days"] = sorted(config_dict["active_days"])
        if "auto_call_enabled" not in config_dict:
            config_dict["auto_call_enabled"] = True
        
        logger.info(f"New config with defaults: {config_dict}")
        updated_config = await ScheduleConfigService.create_schedule_config(
            organization_id=organization.id,
            config_data=config_dict,
            campaign_id=campaign_id,
            db=db
        )
    
    # Refresh the config from the database to ensure we have the latest data
    refreshed_config = await ScheduleConfigService.get_organization_schedule_config(
        organization_id=organization.id,
        campaign_id=campaign_id,
        db=db
    )
    
    if refreshed_config:
        # Use the refreshed config data
        config_data = refreshed_config.config_json
        logger.info(f"Refreshed config data: {config_data}")
    else:
        # Fallback to the updated config if refresh fails
        config_data = updated_config.config_json
        logger.info(f"Using updated config data: {config_data}")
    
    # Get active days and sort them for consistency
    active_days = config_data.get("active_days", ["monday", "tuesday", "wednesday", "thursday", "friday"])
    active_days.sort()
    
    response = ScheduleConfigResponse(
        id=updated_config.id,
        organization_id=updated_config.organization_id,
        campaign_id=updated_config.campaign_id,
        start_time=config_data.get("start_time", "09:00"),
        end_time=config_data.get("end_time", "17:00"),
        timezone=config_data.get("timezone", "America/New_York"),
        active_days=active_days,
        auto_call_enabled=config_data.get("auto_call_enabled", True),
        created_at=updated_config.created_at.isoformat() if hasattr(updated_config, "created_at") else "",
        updated_at=updated_config.updated_at.isoformat() if hasattr(updated_config, "updated_at") else ""
    )
    
    logger.info(f"Returning response: {response}")
    return response 