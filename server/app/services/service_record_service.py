"""
Service record service.
"""

from typing import Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ServiceRecord, Call


class ServiceRecordService:
    """Service for service record operations."""
    
    @staticmethod
    async def get_service_record(
        db: AsyncSession,
        record_id: int,
        organization_id: UUID) -> ServiceRecord:
        """
        Get service record by ID within an organization.
        
        Args:
            record_id: Service record ID
            organization_id: Organization ID
            db: Database session
            
        Returns:
            ServiceRecord: Service record with given ID
            
        Raises:
            HTTPException: If service record not found
        """
        result = await db.execute(
            select(ServiceRecord).where(
                ServiceRecord.id == record_id,
                ServiceRecord.organization_id == organization_id
            )
        )
        record = result.scalar_one_or_none()
        
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service record not found"
            )
            
        return record
    
    @staticmethod
    async def list_service_records(
        db: AsyncSession,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        campaign_id: Optional[int] = None
    ) -> List[ServiceRecord]:
        """
        List service records in an organization with filtering options.
        
        Args:
            db: Database session
            organization_id: Organization ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Filter by service record status
            campaign_id: Filter by campaign ID
            
        Returns:
            List[ServiceRecord]: List of service records
        """
        # Build base query
        query = select(ServiceRecord).where(ServiceRecord.organization_id == organization_id)
        
        # Apply filters
        if status:
            query = query.where(ServiceRecord.status == status)
            
        if campaign_id:
            query = query.where(ServiceRecord.campaign_id == campaign_id)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        result = await db.execute(query)
        
        return list(result.scalars().all())
    
    @staticmethod
    async def create_service_record(
        db: AsyncSession,
        record_data: Dict,
        organization_id: UUID) -> ServiceRecord:
        """
        Create a new service record.
        
        Args:
            record_data: Service record data
            organization_id: Organization ID
            db: Database session
            
        Returns:
            ServiceRecord: Created service record
        """
        # Create service record
        record = ServiceRecord(
            organization_id=organization_id,
            **record_data
        )
        
        db.add(record)
        await db.commit()
        await db.refresh(record)
        
        return record
    
    @staticmethod
    async def update_service_record(
        db: AsyncSession,
        record_id: int,
        organization_id: UUID,
        record_data: Dict) -> ServiceRecord:
        """
        Update service record.
        
        Args:
            record_id: Service record ID
            organization_id: Organization ID
            record_data: Updated service record data
            db: Database session
            
        Returns:
            ServiceRecord: Updated service record
            
        Raises:
            HTTPException: If service record not found
        """
        # Get service record
        record = await ServiceRecordService.get_service_record(record_id, organization_id, db)
        
        # Update service record fields
        for field, value in record_data.items():
            setattr(record, field, value)
        
        # Save changes
        await db.commit()
        await db.refresh(record)
        
        return record
    
    @staticmethod
    async def delete_service_record(
        db: AsyncSession,
        record_id: int,
        organization_id: UUID) -> None:
        """
        Delete service record.
        
        Args:
            record_id: Service record ID
            organization_id: Organization ID
            db: Database session
            
        Raises:
            HTTPException: If service record not found or has associated calls
        """
        # Get service record
        record = await ServiceRecordService.get_service_record(record_id, organization_id, db)
        
        # Check if service record has associated calls
        calls_query = select(func.count()).where(
            Call.service_record_id == record_id
        )
        calls_result = await db.execute(calls_query)
        calls_count = calls_result.scalar_one_or_none() or 0
        
        if calls_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete service record with {calls_count} associated calls"
            )
        
        # Delete service record
        await db.delete(record)
        await db.commit()
    
    @staticmethod
    async def get_service_record_stats(
        db: AsyncSession,
        organization_id: UUID
    ) -> Dict:
        """
        Get service record statistics.
        
        Args:
            db: Database session
            organization_id: Organization ID
            
        Returns:
            Dict: Service record statistics
        """
        # Query total service records
        total_query = select(func.count()).where(
            ServiceRecord.organization_id == organization_id
        )
        total_result = await db.execute(total_query)
        total_records = total_result.scalar_one_or_none() or 0
        
        # Query service records by status
        status_counts = {}
        for status_type in ["Scheduled", "In Progress", "Completed", "Canceled"]:
            status_query = select(func.count()).where(
                ServiceRecord.organization_id == organization_id,
                ServiceRecord.status == status_type
            )
            status_result = await db.execute(status_query)
            status_counts[status_type.lower()] = status_result.scalar_one_or_none() or 0
        
        # Calculate completion rate
        completion_rate = 0
        if total_records > 0:
            completed = status_counts.get("completed", 0)
            completion_rate = (completed / total_records) * 100
        
        return {
            "total_records": total_records,
            "scheduled": status_counts.get("scheduled", 0),
            "in_progress": status_counts.get("in progress", 0),
            "completed": status_counts.get("completed", 0),
            "canceled": status_counts.get("canceled", 0),
            "completion_rate": round(completion_rate, 2),
        } 