"""
Inquiry model for customer inquiries.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Inquiry(Base):
    """
    Inquiry model for customer questions and information requests.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Customer information
    customer_name = Column(String(100), nullable=False)
    email = Column(String(150))
    phone = Column(String(20))
    
    # Inquiry content
    message = Column(Text, nullable=False)
    
    # Status (e.g., "New", "In Progress", "Responded", "Closed")
    status = Column(String(20), nullable=False, default="New")
    
    # Relationships
    organization = relationship("Organization", back_populates="inquiries")
    
    def __repr__(self) -> str:
        return f"<Inquiry {self.id}: {self.customer_name} - {self.status}>" 