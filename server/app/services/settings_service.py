"""
Settings service for managing organization settings.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models import Setting
from app.schemas import SettingCreate, SettingUpdate


class SettingsService:
    """Service for managing organization settings."""
    
    @staticmethod
    async def list_settings(
        db: AsyncSession,
        organization_id: UUID,
        category: Optional[str]) -> List[Setting]:
        """
        List settings for an organization.
        
        Args:
            organization_id: Organization ID
            db: Database session
            category: Filter by category
            
        Returns:
            List[Setting]: List of settings
        """
        query = select(Setting).where(Setting.organization_id == organization_id)
        
        if category:
            query = query.where(Setting.category == category)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_setting(
        db: AsyncSession,
        setting_id: int,
        organization_id: UUID) -> Setting:
        """
        Get setting by ID.
        
        Args:
            setting_id: Setting ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Setting: Setting object
            
        Raises:
            NotFoundException: If setting not found
        """
        query = select(Setting).where(
            Setting.id == setting_id,
            Setting.organization_id == organization_id
        )
        
        result = await db.execute(query)
        setting = result.scalar_one_or_none()
        
        if setting is None:
            raise NotFoundException(f"Setting with ID {setting_id} not found")
        
        return setting
    
    @staticmethod
    async def get_setting_by_key(
        db: AsyncSession,
        key: str,
        organization_id: UUID) -> Optional[Setting]:
        """
        Get setting by key.
        
        Args:
            key: Setting key
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Optional[Setting]: Setting object or None if not found
        """
        query = select(Setting).where(
            Setting.key == key,
            Setting.organization_id == organization_id
        )
        
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_setting(
        db: AsyncSession,
        setting_data: SettingCreate) -> Setting:
        """
        Create a new setting.
        
        Args:
            setting_data: Setting data
            db: Database session
            
        Returns:
            Setting: Created setting
        """
        setting = Setting(**setting_data.model_dump())
        
        db.add(setting)
        await db.commit()
        await db.refresh(setting)
        
        return setting
    
    @staticmethod
    async def update_setting(
        db: AsyncSession,
        setting_id: int,
        organization_id: UUID,
        setting_data: SettingUpdate) -> Setting:
        """
        Update setting.
        
        Args:
            setting_id: Setting ID
            organization_id: Organization ID
            setting_data: Updated setting data
            db: Database session
            
        Returns:
            Setting: Updated setting
            
        Raises:
            NotFoundException: If setting not found
        """
        setting = await SettingsService.get_setting(
            setting_id=setting_id,
            organization_id=organization_id,
            db=db
        )
        
        # Update fields
        update_data = setting_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(setting, field, value)
        
        await db.commit()
        await db.refresh(setting)
        
        return setting
    
    @staticmethod
    async def update_setting_by_key(
        db: AsyncSession,
        key: str,
        organization_id: UUID,
        value: Any,
        description: Optional[str]) -> Setting:
        """
        Update setting by key.
        
        Args:
            key: Setting key
            organization_id: Organization ID
            value: New value
            description: New description
            db: Database session
            
        Returns:
            Setting: Updated setting
            
        Raises:
            NotFoundException: If setting not found
        """
        setting = await SettingsService.get_setting_by_key(
            key=key,
            organization_id=organization_id,
            db=db
        )
        
        if setting is None:
            raise NotFoundException(f"Setting with key '{key}' not found")
        
        # Update fields
        setting.value = value
        if description is not None:
            setting.description = description
        
        await db.commit()
        await db.refresh(setting)
        
        return setting
    
    @staticmethod
    async def delete_setting(
        db: AsyncSession,
        setting_id: int,
        organization_id: UUID) -> None:
        """
        Delete setting.
        
        Args:
            setting_id: Setting ID
            organization_id: Organization ID
            db: Database session
            
        Raises:
            NotFoundException: If setting not found
        """
        setting = await SettingsService.get_setting(
            setting_id=setting_id,
            organization_id=organization_id,
            db=db
        )
        
        await db.delete(setting)
        await db.commit()
    
    @staticmethod
    async def get_settings_by_category(
        db: AsyncSession,
        organization_id: UUID) -> Dict[str, Dict[str, Any]]:
        """
        Get all settings organized by category.
        
        Args:
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict[str, Dict[str, Any]]: Settings organized by category
        """
        settings = await SettingsService.list_settings(
            organization_id=organization_id,
            db=db
        )
        
        # Organize settings by category
        result = {}
        for setting in settings:
            category = setting.category
            if category not in result:
                result[category] = {}
            
            result[category][setting.key] = {
                "id": setting.id,
                "value": setting.value,
                "description": setting.description
            }
        
        return result 