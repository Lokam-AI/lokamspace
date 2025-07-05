"""
Tag model for categorization.
"""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Tag(Base):
    """
    Tag model for categorizing entities.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Tag details
    name = Column(String(50), nullable=False)
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="tags")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tags")
    
    def __repr__(self) -> str:
        return f"<Tag {self.id}: {self.name}>" 