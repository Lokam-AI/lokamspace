"""
Tags API endpoints.
"""

from typing import Any, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_organization, get_current_user, get_tenant_db
from app.models import Organization, User, Tag
from app.schemas import TagBase, TagCreate, TagInDB, TagResponse, TagsCheckResponse, TagUpdate
from app.services.tag_service import TagService
from app.services.settings_service import SettingsService

router = APIRouter()


@router.get("/", response_model=List[TagResponse])
async def list_tags(
    tag_type: Optional[str] = Query(None, description="Filter by tag type"),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    List tags.
    
    Args:
        tag_type: Filter by tag type
        organization: Current organization
        db: Database session
        
    Returns:
        List[TagResponse]: List of tags
    """
    return await TagService.list_tags(
        organization_id=organization.id,
        tag_type=tag_type,
        db=db
    )


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Create a new tag.
    
    Args:
        tag_data: Tag data
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TagResponse: Created tag
    """
    # Ensure organization ID matches
    if tag_data.organization_id != organization.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization ID mismatch"
        )
    
    tag_data.created_by = current_user.id
    
    return await TagService.create_tag(
        organization_id=organization.id,
        name=tag_data.name,
        tag_type=tag_data.tag_type,
        user_id=current_user.id,
        db=db
    )


@router.get("/check-required", response_model=TagsCheckResponse)
async def check_required_tags(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Check if required tags are set up.
    
    Args:
        organization: Current organization
        db: Database session
        
    Returns:
        TagsCheckResponse: Status of required tags
    """
    return await TagService.check_required_tags(
        organization_id=organization.id,
        db=db
    )


@router.get("/focus-areas", response_model=List[str])
async def get_focus_areas(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> List[str]:
    tags = await TagService.list_tags(db=db, organization_id=organization.id, tag_type="areas_to_focus")
    return [tag.name for tag in tags]

@router.put("/focus-areas", status_code=status.HTTP_200_OK)
async def update_focus_areas(
    focus_areas: List[str] = Body(...),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> dict:
    existing = await TagService.list_tags(db=db, organization_id=organization.id, tag_type="areas_to_focus")
    for tag in existing:
        await TagService.delete_tag(db=db, organization_id=organization.id, tag_id=tag.id)
    for name in focus_areas:
        await TagService.create_tag(db=db, organization_id=organization.id, name=name, tag_type="areas_to_focus", user_id=current_user.id)
    await db.commit()
    return {"message": "Focus areas updated successfully", "focus_areas": focus_areas}


@router.get("/service-types", response_model=List[str])
async def get_service_types(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> List[str]:
    tags = await TagService.list_tags(db=db, organization_id=organization.id, tag_type="service_types")
    return [tag.name for tag in tags]

@router.put("/service-types", status_code=status.HTTP_200_OK)
async def update_service_types(
    service_types: List[str] = Body(...),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> dict:
    existing = await TagService.list_tags(db=db, organization_id=organization.id, tag_type="service_types")
    for tag in existing:
        await TagService.delete_tag(db=db, organization_id=organization.id, tag_id=tag.id)
    for name in service_types:
        await TagService.create_tag(db=db, organization_id=organization.id, name=name, tag_type="service_types", user_id=current_user.id)
    await db.commit()
    return {"message": "Service types updated successfully", "service_types": service_types}


@router.get("/inquiry-topics", response_model=List[str])
async def get_inquiry_topics(
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> List[str]:
    tags = await TagService.list_tags(db=db, organization_id=organization.id, tag_type="inquiry_topics")
    return [tag.name for tag in tags]

@router.put("/inquiry-topics", status_code=status.HTTP_200_OK)
async def update_inquiry_topics(
    inquiry_topics: List[str] = Body(...),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> dict:
    existing = await TagService.list_tags(db=db, organization_id=organization.id, tag_type="inquiry_topics")
    for tag in existing:
        await TagService.delete_tag(db=db, organization_id=organization.id, tag_id=tag.id)
    for name in inquiry_topics:
        await TagService.create_tag(db=db, organization_id=organization.id, name=name, tag_type="inquiry_topics", user_id=current_user.id)
    await db.commit()
    return {"message": "Inquiry topics updated successfully", "inquiry_topics": inquiry_topics}


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Get tag by ID.
    
    Args:
        tag_id: Tag ID
        organization: Current organization
        db: Database session
        
    Returns:
        TagResponse: Tag details
    """
    return await TagService.get_tag(
        tag_id=tag_id,
        organization_id=organization.id,
        db=db
    )


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_data: TagUpdate,
    tag_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> Any:
    """
    Update tag.
    
    Args:
        tag_data: Updated tag data
        tag_id: Tag ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        TagResponse: Updated tag
    """
    return await TagService.update_tag(
        tag_id=tag_id,
        organization_id=organization.id,
        tag_data=tag_data,
        db=db
    )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int = Path(..., ge=1),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_tenant_db),
) -> None:
    """
    Delete tag.
    
    Args:
        tag_id: Tag ID
        organization: Current organization
        current_user: Current authenticated user
        db: Database session
    """
    await TagService.delete_tag(
        tag_id=tag_id,
        organization_id=organization.id,
        db=db
    ) 