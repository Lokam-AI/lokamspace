"""
DMSIntegration model for Dealer Management System integrations.
"""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from .base import Base


class DMSIntegration(Base):
    """
    DMSIntegration model for Dealer Management System integrations.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Integration details
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # e.g., "CDK", "Reynolds", "DealerTrack"
    config = Column(JSONB, nullable=False)  # Credentials, endpoints, etc.
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="dms_integrations")
    
    def __repr__(self) -> str:
        return f"<DMSIntegration {self.id}: {self.name} ({self.type})>" 