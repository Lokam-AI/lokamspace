from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from datetime import datetime

from ...db.session import get_db
from ...db.base import Organization, User
from ..dependencies import get_current_user
from ...schemas.organization import OrganizationResponse, OrganizationUpdate
from src.core.response import ResponseBuilder
from src.schemas.standard_response import StandardResponse

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=StandardResponse[OrganizationResponse])
async def get_organization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get organization details including total usage.
    """
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            return ResponseBuilder.error(message="Organization not found")
        
        
        return ResponseBuilder.success(
            data=organization,
            message="Organization details retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error retrieving organization details: {str(e)}")
        return ResponseBuilder.error(message=f"Error retrieving organization details: {str(e)}")

@router.patch("/", response_model=StandardResponse[OrganizationResponse])
async def update_organization(
    org_data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add organization details.
    """
    try:
        organization = db.query(Organization).filter(
            Organization.id == current_user.organization_id
        ).first()
        
        if not organization:
            return ResponseBuilder.error(message="Organization not found")
        
        # Update organization fields
        for field, value in org_data.dict(exclude_unset=True).items():
            setattr(organization, field, value)
        
        organization.modified_at = datetime.utcnow()
        
        db.commit()
        db.refresh(organization)
        
        return ResponseBuilder.success(
            data=organization,
            message="Organization details updated successfully"
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating organization details: {str(e)}")
        return ResponseBuilder.error(message=f"Error updating organization details: {str(e)}") 