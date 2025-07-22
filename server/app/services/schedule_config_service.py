"""
Schedule configuration service.
"""

import logging
from typing import Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule_config import ScheduleConfig

# Set up logging
logger = logging.getLogger(__name__)


class ScheduleConfigService:
    """Service for managing call schedule configurations."""
    
    @staticmethod
    async def get_organization_schedule_config(
        organization_id: UUID,
        campaign_id: Optional[int] = None,
        db: AsyncSession = None
    ) -> Optional[ScheduleConfig]:
        """
        Get schedule configuration for an organization.
        
        Args:
            organization_id: Organization ID
            campaign_id: Optional campaign ID filter
            db: Database session
            
        Returns:
            Optional[ScheduleConfig]: Schedule configuration if found
        """
        logger.info(f"Getting schedule config for org: {organization_id}, campaign: {campaign_id}")
        
        query = select(ScheduleConfig).where(
            ScheduleConfig.organization_id == organization_id
        )
        
        if campaign_id:
            logger.info(f"Filtering by campaign_id: {campaign_id}")
            query = query.where(ScheduleConfig.campaign_id == campaign_id)
        else:
            # For org-wide config, campaign_id should be NULL
            logger.info("Filtering for org-wide config (campaign_id IS NULL)")
            query = query.where(ScheduleConfig.campaign_id.is_(None))
        
        result = await db.execute(query)
        config = result.scalar_one_or_none()
        
        if config:
            logger.info(f"Found config: {config.id}, JSON: {config.config_json}")
        else:
            logger.info("No config found")
            
        return config
    
    @staticmethod
    async def create_schedule_config(
        organization_id: UUID,
        config_data: Dict,
        campaign_id: Optional[int] = None,
        db: AsyncSession = None
    ) -> ScheduleConfig:
        """
        Create a new schedule configuration.
        
        Args:
            organization_id: Organization ID
            config_data: Configuration data
            campaign_id: Optional campaign ID
            db: Database session
            
        Returns:
            ScheduleConfig: Created schedule configuration
        """
        logger.info(f"Creating new config for org: {organization_id}, campaign: {campaign_id}")
        logger.info(f"Config data: {config_data}")
        
        try:
            # Validate config_data contains required fields
            required_fields = ["start_time", "end_time", "timezone", "active_days"]
            for field in required_fields:
                if field not in config_data:
                    logger.warning(f"Missing required field {field} in config data")
            
            schedule_config = ScheduleConfig(
                organization_id=organization_id,
                campaign_id=campaign_id,
                config_json=config_data
            )
            
            db.add(schedule_config)
            await db.commit()
            await db.refresh(schedule_config)
            
            logger.info(f"Created config: {schedule_config.id}, json: {schedule_config.config_json}")
            
            return schedule_config
        except Exception as e:
            logger.error(f"Error creating schedule config: {str(e)}")
            # Rollback if error
            await db.rollback()
            raise
    
    @staticmethod
    async def update_schedule_config(
        organization_id: UUID,
        config_data: Dict,
        campaign_id: Optional[int] = None,
        db: AsyncSession = None
    ) -> ScheduleConfig:
        """
        Update an existing schedule configuration.
        
        Args:
            organization_id: Organization ID
            config_data: Configuration data
            campaign_id: Optional campaign ID filter
            db: Database session
            
        Returns:
            ScheduleConfig: Updated schedule configuration
        """
        logger.info(f"Updating config for org: {organization_id}, campaign: {campaign_id}, data: {config_data}")
        
        try:
            schedule_config = await ScheduleConfigService.get_organization_schedule_config(
                organization_id=organization_id,
                campaign_id=campaign_id,
                db=db
            )
            
            # Create if not exists
            if not schedule_config:
                logger.info("No existing config found. Creating new config.")
                return await ScheduleConfigService.create_schedule_config(
                    organization_id=organization_id,
                    config_data=config_data,
                    campaign_id=campaign_id,
                    db=db
                )
            
            # Update existing config
            logger.info(f"Updating existing config: {schedule_config.id}")
            logger.info(f"Previous config_json: {schedule_config.config_json}")
            
            schedule_config.config_json = config_data
            await db.commit()
            await db.refresh(schedule_config)
            
            # Verify the update was successful
            logger.info(f"Updated config: {schedule_config.id}, json: {schedule_config.config_json}")
            
            return schedule_config
        except Exception as e:
            logger.error(f"Error updating schedule config: {str(e)}")
            # Rollback if error
            await db.rollback()
            raise
    
    @staticmethod
    async def delete_schedule_config(
        organization_id: UUID,
        campaign_id: Optional[int] = None,
        db: AsyncSession = None
    ) -> bool:
        """
        Delete a schedule configuration.
        
        Args:
            organization_id: Organization ID
            campaign_id: Optional campaign ID
            db: Database session
            
        Returns:
            bool: True if deleted, False if not found
        """
        schedule_config = await ScheduleConfigService.get_organization_schedule_config(
            organization_id=organization_id,
            campaign_id=campaign_id,
            db=db
        )
        
        if not schedule_config:
            return False
        
        await db.delete(schedule_config)
        await db.commit()
        
        return True 