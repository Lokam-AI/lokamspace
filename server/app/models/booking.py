"""
Booking model for appointments.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Booking(Base):
    """
    Booking model for appointments and scheduled calls.
    """
    
# Table name - explicitly set
    
    # Table name - explicitly set
    __tablename__ = "bookings"
    

    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # Campaign relationship (optional)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    
    # Booking details
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), nullable=False, default="Scheduled")  # Scheduled, Completed, Canceled, No-show
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    modified_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="bookings")
    campaign = relationship("Campaign", back_populates="bookings")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_bookings")
    modifier = relationship("User", foreign_keys=[modified_by], back_populates="modified_bookings")
    
    def __repr__(self) -> str:
        return f"<Booking {self.id}: {self.scheduled_time} - {self.status}>" 