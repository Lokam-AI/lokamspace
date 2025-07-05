"""
ServiceRecord model for customer service records.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from .base import Base


class ServiceRecord(Base):
    """
    ServiceRecord model for tracking customer service information.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organization.id"),
        nullable=False
    )
    
    # Campaign relationship
    campaign_id = Column(Integer, ForeignKey("campaign.id"), nullable=True)
    
    # Customer information
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    vehicle_info = Column(String(100))
    
    # Service details
    service_type = Column(String(50))
    status = Column(String(20), nullable=False, default="Scheduled")
    appointment_date = Column(DateTime(timezone=True))
    
    # Service advisor information
    service_advisor_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    service_advisor_name = Column(String(100), nullable=True)
    
    # Feedback
    feedback = Column(Text)
    rating = Column(SmallInteger)
    overall_feedback = Column(Text, nullable=True)
    positive_mentions = Column(ARRAY(String), nullable=True)
    areas_to_improve = Column(ARRAY(String), nullable=True)
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("user.id"))
    modified_by = Column(Integer, ForeignKey("user.id"))
    
    # Relationships
    organization = relationship("Organization", back_populates="service_records")
    campaign = relationship("Campaign", back_populates="service_records")
    creator = relationship("User", foreign_keys=[created_by])
    modifier = relationship("User", foreign_keys=[modified_by])
    service_advisor = relationship("User", foreign_keys=[service_advisor_id])
    calls = relationship("Call", back_populates="service_record")
    
    def __repr__(self) -> str:
        return f"<ServiceRecord {self.id}: {self.customer_name} - {self.status}>"
