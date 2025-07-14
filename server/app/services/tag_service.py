"""
Tag service for managing tags.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models import Tag, User
from app.schemas import TagUpdate


class TagService:
    """Service for tag operations."""
    
    TAG_TYPES = ["areas_to_focus", "service_types", "inquiry_topics"]
    MIN_TAGS_PER_TYPE = 5
    MAX_TAGS_PER_TYPE = 10
    
    @staticmethod
    async def list_tags(
        db: AsyncSession,
        organization_id: UUID,
        tag_type: Optional[str] = None
    ) -> List[Tag]:
        """
        List tags for an organization.
        
        Args:
            db: Database session
            organization_id: Organization ID
            tag_type: Filter by tag type
            
        Returns:
            List[Tag]: List of tags
        """
        query = select(Tag).where(Tag.organization_id == organization_id)
        
        if tag_type:
            query = query.where(Tag.type == tag_type)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def create_tag(
        db: AsyncSession,
        organization_id: UUID,
        name: str,
        tag_type: str,
        user_id: int
    ) -> Tag:
        """
        Create a new tag.
        
        Args:
            db: Database session
            organization_id: Organization ID
            name: Tag name
            tag_type: Tag type (areas_to_focus, service_types, inquiry_topics)
            user_id: ID of user creating the tag
            
        Returns:
            Tag: Created tag
        """
        # Validate tag type
        if tag_type not in TagService.TAG_TYPES:
            raise ValueError(f"Invalid tag type. Must be one of: {', '.join(TagService.TAG_TYPES)}")
        
        # Check if we've reached the maximum tags for this type
        count_query = select(func.count()).where(
            Tag.organization_id == organization_id,
            Tag.type == tag_type
        )
        result = await db.execute(count_query)
        count = result.scalar()
        
        if count >= TagService.MAX_TAGS_PER_TYPE:
            raise ValueError(f"Maximum of {TagService.MAX_TAGS_PER_TYPE} tags per type allowed")
        
        # Create tag
        tag = Tag(
            organization_id=organization_id,
            name=name,
            type=tag_type,
            created_by=user_id
        )
        
        db.add(tag)
        await db.commit()
        await db.refresh(tag)
        
        return tag
    
    @staticmethod
    async def delete_tag(
        db: AsyncSession,
        organization_id: UUID,
        tag_id: int
    ) -> None:
        """
        Delete a tag.
        
        Args:
            db: Database session
            organization_id: Organization ID
            tag_id: Tag ID
            
        Returns:
            None
        """
        # Get the tag
        query = select(Tag).where(
            Tag.id == tag_id,
            Tag.organization_id == organization_id
        )
        result = await db.execute(query)
        tag = result.scalar_one_or_none()
        
        if not tag:
            raise NotFoundException(f"Tag with ID {tag_id} not found")
        
        # Delete tag
        await db.delete(tag)
        await db.commit()
    
    @staticmethod
    async def check_and_create_default_tags(
        db: AsyncSession,
        organization_id: UUID,
        user_id: int
    ) -> dict:
        result = {
            "created_tags": [],
            "existing_tags": {}
        }
        
        default_tags = {
            "service_types": [
                "General Inquiry",
                "Appointment Request",
                "Technical Support",
                "Billing & Payments",
                "Feedback or Complaint"
            ],
            "inquiry_topics": [
                "Vehicle Service Delay",
                "Staff Behavior",
                "Pricing Transparency",
                "Service Quality",
                "Follow-up Communication"
            ],
            "areas_to_focus": [
                "Reduce Wait Time",
                "Improve Advisor Communication",
                "Increase Service Transparency",
                "Enhance Customer Experience",
                "Streamline Booking Process"
            ]
        }
        
        for tag_type in TagService.TAG_TYPES:
            query = select(Tag).where(
                Tag.organization_id == organization_id,
                Tag.type == tag_type
            )
            existing_tags = (await db.execute(query)).scalars().all()
            result["existing_tags"][tag_type] = [tag.name for tag in existing_tags]
            
            if len(existing_tags) == 0:
                existing_names = {tag.name.lower() for tag in existing_tags}
                for tag_name in default_tags[tag_type]:
                    if tag_name.lower() not in existing_names:
                        tag = Tag(
                            organization_id=organization_id,
                            name=tag_name,
                            type=tag_type,
                            created_by=user_id
                        )
                        db.add(tag)
                        result["created_tags"].append({
                            "type": tag_type,
                            "name": tag_name
                        })
                        existing_names.add(tag_name.lower())
        
        await db.commit()
        return result 

    @staticmethod
    async def get_tag(
        db: AsyncSession,
        organization_id: UUID,
        tag_id: int
    ) -> Tag:
        query = select(Tag).where(
            Tag.organization_id == organization_id,
            Tag.id == tag_id
        )
        result = await db.execute(query)
        tag = result.scalar_one_or_none()
        if not tag:
            raise NotFoundException(f"Tag with ID {tag_id} not found")
        return tag

    @staticmethod
    async def update_tag(
        db: AsyncSession,
        organization_id: UUID,
        tag_id: int,
        tag_data: TagUpdate
    ) -> Tag:
        tag = await TagService.get_tag(db, organization_id, tag_id)
        update_data = tag_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tag, field, value)
        await db.commit()
        await db.refresh(tag)
        return tag

    @staticmethod
    async def check_required_tags(
        db: AsyncSession,
        organization_id: UUID
    ) -> dict:
        result = {"missing_types": []}
        for tag_type in TagService.TAG_TYPES:
            count_query = select(func.count()).where(
                Tag.organization_id == organization_id,
                Tag.type == tag_type
            )
            result_count = await db.execute(count_query)
            count = result_count.scalar()
            if count < TagService.MIN_TAGS_PER_TYPE:
                result["missing_types"].append(tag_type)
        return result 