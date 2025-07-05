"""
Campaign model for organizing outbound call campaigns.
"""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Campaign(Base):
    """
    Campaign model for organizing outbound call campaigns.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Campaign details
    name = Column(String(150), nullable=False)
    description = Column(Text)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Status (e.g., "Draft", "Active", "Completed", "Paused")
    status = Column(String(20), nullable=False, default="Draft")
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    modified_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="campaigns")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_campaigns")
    modifier = relationship("User", foreign_keys=[modified_by], back_populates="modified_campaigns")
    service_records = relationship("ServiceRecord", back_populates="campaign")
    calls = relationship("Call", back_populates="campaign")
    bookings = relationship("Booking", back_populates="campaign")
    schedule_configs = relationship("ScheduleConfig", back_populates="campaign")
    
    def __repr__(self) -> str:
        return f"<Campaign {self.name} ({self.status})>"
