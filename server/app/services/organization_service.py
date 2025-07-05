"""
Organization service.
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Call, Organization, ServiceRecord
from app.schemas import OrganizationCreate, OrganizationUpdate, OrganizationSettingsUpdate


class OrganizationService:
    """Service for organization operations."""
    
    @staticmethod
    async def get_organization(
        db: AsyncSession,
        organization_id: UUID) -> Organization:
        """
        Get organization by ID.
        
        Args:
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Organization: Organization with given ID
            
        Raises:
            HTTPException: If organization not found
        """
        result = await db.execute(
            select(Organization).where(Organization.id == organization_id)
        )
        organization = result.scalar_one_or_none()
        
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
            
        return organization
    
    @staticmethod
    async def create_organization(
        db: AsyncSession,
        organization_data: OrganizationCreate) -> Organization:
        """
        Create a new organization.
        
        Args:
            organization_data: Organization creation data
            db: Database session
            
        Returns:
            Organization: Created organization
        """
        # Create organization
        organization = Organization(**organization_data.model_dump())
        
        db.add(organization)
        await db.commit()
        await db.refresh(organization)
        
        # Initialize default settings for the organization
        from app.services.settings_service import SettingsService
        await SettingsService.initialize_default_settings(
            db=db,
            organization_id=organization.id
        )
        
        return organization
    
    @staticmethod
    async def update_organization(
        db: AsyncSession,
        organization_id: UUID,
        organization_data: OrganizationUpdate) -> Organization:
        """
        Update organization.
        
        Args:
            organization_id: Organization ID
            organization_data: Updated organization data
            db: Database session
            
        Returns:
            Organization: Updated organization
            
        Raises:
            HTTPException: If organization not found
        """
        # Get organization
        organization = await OrganizationService.get_organization(
            db=db,
            organization_id=organization_id
        )
        
        # Update organization fields
        update_data = organization_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(organization, field, value)
        
        # Save changes
        await db.commit()
        await db.refresh(organization)
        
        return organization
    
    @staticmethod
    async def update_organization_settings(
        db: AsyncSession,
        organization_id: UUID,
        settings_data: OrganizationSettingsUpdate) -> Organization:
        """
        Update organization settings.
        
        Args:
            organization_id: Organization ID
            settings_data: Updated organization settings
            db: Database session
            
        Returns:
            Organization: Updated organization
            
        Raises:
            HTTPException: If organization not found
        """
        # Get organization
        organization = await OrganizationService.get_organization(
            db=db,
            organization_id=organization_id
        )
        
        # Update organization fields
        update_data = settings_data.model_dump(exclude_unset=True)
        
        # Update location field for backward compatibility
        if 'location_city' in update_data and update_data['location_city']:
            update_data['location'] = update_data['location_city']
        
        for field, value in update_data.items():
            setattr(organization, field, value)
        
        # Save changes
        await db.commit()
        await db.refresh(organization)
        
        return organization
    
    @staticmethod
    async def update_organization_configuration(
        db: AsyncSession,
        organization_id: UUID,
        config_data: dict) -> Organization:
        """
        Update organization configuration.
        
        Args:
            organization_id: Organization ID
            config_data: Configuration data
            db: Database session
            
        Returns:
            Organization: Updated organization
            
        Raises:
            HTTPException: If organization not found
        """
        # Get organization
        organization = await OrganizationService.get_organization(
            db=db,
            organization_id=organization_id
        )
        
        # Fields that can be updated
        allowed_fields = [
            "description", 
            "service_center_description",
            "focus_areas",
            "service_types", 
            "hipaa_compliant",
            "pci_compliant"
        ]
        
        # Update only allowed fields
        for field in allowed_fields:
            if field in config_data:
                setattr(organization, field, config_data[field])
        
        # Save changes
        await db.commit()
        await db.refresh(organization)
        
        return organization
    
    @staticmethod
    async def get_organization_stats(
        db: AsyncSession,
        organization_id: UUID) -> Dict:
        """
        Get organization statistics.
        
        Args:
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Dict: Organization statistics
        """
        # Query total calls
        calls_query = select(func.count()).where(
            Call.organization_id == organization_id
        )
        calls_result = await db.execute(calls_query)
        total_calls = calls_result.scalar_one_or_none() or 0
        
        # Query completed calls
        completed_calls_query = select(func.count()).where(
            Call.organization_id == organization_id,
            Call.status == "Completed"
        )
        completed_calls_result = await db.execute(completed_calls_query)
        completed_calls = completed_calls_result.scalar_one_or_none() or 0
        
        # Query service records
        service_records_query = select(func.count()).where(
            ServiceRecord.organization_id == organization_id
        )
        service_records_result = await db.execute(service_records_query)
        total_service_records = service_records_result.scalar_one_or_none() or 0
        
        # Get organization for credit balance
        organization = await OrganizationService.get_organization(
            db=db,
            organization_id=organization_id
        )
        
        # Calculate completion rate
        completion_rate = (completed_calls / total_calls) * 100 if total_calls > 0 else 0
        
        return {
            "total_calls": total_calls,
            "completed_calls": completed_calls,
            "completion_rate": round(completion_rate, 2),
            "total_service_records": total_service_records,
            "credit_balance": float(organization.credit_balance),
        } 