from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ...db.base import Organization
from ...db.session import get_db
from ...schemas.organization import OrganizationResponse

router = APIRouter()

@router.get("/", response_model=List[OrganizationResponse])
async def list_organizations(db: Session = Depends(get_db)):
    """
    Retrieve all organizations.
    This is a public endpoint (no authentication required) used during the signup process
    to allow users to see existing organizations before creating a new one or joining an existing one.
    """
    organizations = db.query(Organization).filter(Organization.is_active == True).all()
    return organizations 