"""
Settings service for managing organization settings.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID
import json

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models import Setting, Organization
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
            Optional[Setting]: Setting object or None
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
        Update a setting.
        
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
        
        # Update setting
        data = setting_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(setting, key, value)
        
        await db.commit()
        await db.refresh(setting)
        
        return setting
    
    @staticmethod
    async def update_setting_by_key(
        db: AsyncSession,
        key: str,
        organization_id: UUID,
        value: Any,
        description: Optional[str] = None) -> Setting:
        """
        Update a setting by key or create it if it doesn't exist.
        
        Args:
            key: Setting key
            organization_id: Organization ID
            value: Setting value
            description: Setting description
            db: Database session
            
        Returns:
            Setting: Updated or created setting
        """
        setting = await SettingsService.get_setting_by_key(
            key=key,
            organization_id=organization_id,
            db=db
        )
        
        if setting:
            # Update existing setting
            setting.value = value
            if description:
                setting.description = description
            
            await db.commit()
            await db.refresh(setting)
        else:
            # Create new setting
            setting = Setting()
            setting.organization_id = organization_id
            setting.key = key
            setting.value = value
            setting.category = "general"
            setting.description = description or f"Setting for {key}"
            
            db.add(setting)
            await db.commit()
            await db.refresh(setting)
        
        return setting
    
    @staticmethod
    async def delete_setting(
        db: AsyncSession,
        setting_id: int,
        organization_id: UUID) -> None:
        """
        Delete a setting.
        
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
        organization_id: UUID) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get settings organized by category.
        
        Args:
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Settings by category
        """
        settings = await SettingsService.list_settings(
            organization_id=organization_id,
            category=None,
            db=db
        )
        
        # Organize by category
        result = {}
        for setting in settings:
            if setting.category not in result:
                result[setting.category] = []
            
            result[setting.category].append({
                "id": setting.id,
                "key": setting.key,
                "value": setting.value,
                "description": setting.description,
                "created_at": setting.created_at.isoformat() if setting.created_at else None,
                "updated_at": setting.updated_at.isoformat() if setting.updated_at else None
            })
        
        return result
    
    @staticmethod
    async def initialize_default_settings(
        db: AsyncSession,
        organization_id: UUID) -> None:
        """
        Initialize default settings for an organization.
        
        Args:
            organization_id: Organization ID
            db: Database session
        """
        # Default settings
        default_settings = [
            # Notification settings
            {
                "key": "email_notifications",
                "value": True,
                "category": "notifications",
                "description": "Enable email notifications"
            },
            {
                "key": "sms_notifications",
                "value": True,
                "category": "notifications",
                "description": "Enable SMS notifications"
            },
            
            # Call settings
            {
                "key": "call_recording",
                "value": True,
                "category": "calls",
                "description": "Enable call recording"
            },
            {
                "key": "call_transcription",
                "value": True,
                "category": "calls",
                "description": "Enable call transcription"
            },
            
            # AI settings
            {
                "key": "ai_sentiment_analysis",
                "value": True,
                "category": "ai",
                "description": "Enable AI sentiment analysis"
            },
            {
                "key": "ai_call_summarization",
                "value": True,
                "category": "ai",
                "description": "Enable AI call summarization"
            },
            
            # Tag settings for default inquiry topics
            {
                "key": "inquiry_topics",
                "value": [
                    "Service Estimate Request",
                    "Appointment Scheduling",
                    "Service Status Update",
                    "Billing & Payment Questions",
                    "Warranty Information",
                    "Parts Availability",
                    "Customer Complaints",
                    "General Information Request"
                ],
                "category": "tags",
                "description": "Default inquiry topics"
            },
        ]
        
        # Create settings if they don't exist
        for setting_data in default_settings:
            existing = await SettingsService.get_setting_by_key(
                key=setting_data["key"],
                organization_id=organization_id,
                db=db
            )
            
            if not existing:
                setting = Setting()
                setting.organization_id = organization_id
                setting.key = setting_data["key"]
                setting.value = setting_data["value"]
                setting.category = setting_data["category"]
                setting.description = setting_data["description"]
                db.add(setting)
        
        await db.commit()

    @staticmethod
    async def update_organization_descriptions(
        db: AsyncSession,
        organization_id: UUID,
        company_description: Optional[str] = None,
        service_center_description: Optional[str] = None) -> Organization:
        """
        Update organization descriptions.
        
        Args:
            organization_id: Organization ID
            company_description: Company description
            service_center_description: Service center description
            db: Database session
            
        Returns:
            Organization: Updated organization
        """
        query = select(Organization).where(Organization.id == organization_id)
        result = await db.execute(query)
        organization = result.scalar_one_or_none()
        
        if organization is None:
            raise NotFoundException(f"Organization with ID {organization_id} not found")
        
        if company_description is not None:
            organization.description = company_description
            
        if service_center_description is not None:
            organization.service_center_description = service_center_description
        
        await db.commit()
        await db.refresh(organization)
        
        return organization 