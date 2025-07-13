"""
DMS Integration service.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DMSIntegration
from app.schemas import DMSIntegrationCreate, DMSIntegrationUpdate


class DMSIntegrationService:
    """Service for DMS integration operations."""
    
    @staticmethod
    async def list_dms_integrations(
        organization_id: UUID,
        db: AsyncSession
    ) -> List[DMSIntegration]:
        """
        List DMS integrations for an organization.
        
        Args:
            organization_id: Organization ID
            db: Database session
            
        Returns:
            List[DMSIntegration]: List of DMS integrations
        """
        result = await db.execute(
            select(DMSIntegration)
            .where(DMSIntegration.organization_id == organization_id)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_dms_integration(
        integration_id: int,
        organization_id: UUID,
        db: AsyncSession
    ) -> Optional[DMSIntegration]:
        """
        Get a DMS integration by ID.
        
        Args:
            integration_id: DMS integration ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Optional[DMSIntegration]: DMS integration if found
        """
        result = await db.execute(
            select(DMSIntegration)
            .where(
                DMSIntegration.id == integration_id,
                DMSIntegration.organization_id == organization_id
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_active_dms_integration(
        organization_id: UUID,
        db: AsyncSession
    ) -> Optional[DMSIntegration]:
        """
        Get the active DMS integration for an organization.
        
        Args:
            organization_id: Organization ID
            db: Database session
            
        Returns:
            Optional[DMSIntegration]: Active DMS integration if found
        """
        result = await db.execute(
            select(DMSIntegration)
            .where(
                DMSIntegration.organization_id == organization_id,
                DMSIntegration.is_active == True
            )
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_dms_integration(
        integration_data: DMSIntegrationCreate,
        db: AsyncSession
    ) -> DMSIntegration:
        """
        Create a new DMS integration.
        
        Args:
            integration_data: DMS integration data
            db: Database session
            
        Returns:
            DMSIntegration: Created DMS integration
        """
        integration = DMSIntegration(**integration_data.model_dump())
        db.add(integration)
        await db.commit()
        await db.refresh(integration)
        return integration
    
    @staticmethod
    async def update_dms_integration(
        integration_id: int,
        organization_id: UUID,
        integration_data: DMSIntegrationUpdate,
        db: AsyncSession
    ) -> Optional[DMSIntegration]:
        """
        Update a DMS integration.
        
        Args:
            integration_id: DMS integration ID
            organization_id: Organization ID
            integration_data: Updated DMS integration data
            db: Database session
            
        Returns:
            Optional[DMSIntegration]: Updated DMS integration if found
        """
        integration = await DMSIntegrationService.get_dms_integration(
            integration_id=integration_id,
            organization_id=organization_id,
            db=db
        )
        
        if not integration:
            return None
        
        # Update fields
        update_data = integration_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(integration, field, value)
        
        await db.commit()
        await db.refresh(integration)
        return integration
    
    @staticmethod
    async def delete_dms_integration(
        integration_id: int,
        organization_id: UUID,
        db: AsyncSession
    ) -> bool:
        """
        Delete a DMS integration.
        
        Args:
            integration_id: DMS integration ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            bool: True if deleted, False if not found
        """
        integration = await DMSIntegrationService.get_dms_integration(
            integration_id=integration_id,
            organization_id=organization_id,
            db=db
        )
        
        if not integration:
            return False
        
        await db.delete(integration)
        await db.commit()
        return True 