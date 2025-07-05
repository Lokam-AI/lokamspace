"""
Organization model for tenant organizations.
"""

import uuid
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from .base import Base


class Organization(Base):
    """
    Stores tenant organizations (auto service centers).
    Fields include basic info and metadata.
    """
    
    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.uuid_generate_v4(),
        nullable=False,
        unique=True,
    )
    
    # Basic info
    name = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    phone_feedback = Column(String(20))
    phone_booking = Column(String(20))  # Renamed from phone_service
    phone_inquiry = Column(String(20))  # Renamed from phone_support
    description = Column(Text)
    service_center_description = Column(Text)
    
    # Location fields
    location = Column(Text)  # Keep for backward compatibility
    location_city = Column(String(255))  # City name (e.g., "New York, NY, USA")
    location_value = Column(String(100))  # City value (e.g., "new-york")
    
    # Business settings
    call_concurrency_limit = Column(Integer, nullable=False, default=1)
    service_types = Column(ARRAY(String(255)))
    focus_areas = Column(ARRAY(String(255)))
    hipaa_compliant = Column(Boolean, nullable=False, default=False)
    pci_compliant = Column(Boolean, nullable=False, default=False)
    
    # Plan and billing
    plan_id = Column(Integer, ForeignKey("plan.id"))
    credit_balance = Column(Numeric(12, 2), nullable=False, default=0.00)
    
    # Relationships
    plan = relationship("Plan", back_populates="organizations")
    users = relationship("User", back_populates="organization")
    campaigns = relationship("Campaign", back_populates="organization")
    service_records = relationship("ServiceRecord", back_populates="organization")
    calls = relationship("Call", back_populates="organization")
    kpis = relationship("KPI", back_populates="organization")
    bookings = relationship("Booking", back_populates="organization")
    inquiries = relationship("Inquiry", back_populates="organization")
    tags = relationship("Tag", back_populates="organization")
    schedule_configs = relationship("ScheduleConfig", back_populates="organization")
    payment_history = relationship("PaymentHistory", back_populates="organization")
    dms_integrations = relationship("DMSIntegration", back_populates="organization")
    settings = relationship("Setting", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")
    knowledge_files = relationship("KnowledgeFile", back_populates="organization")
    
    def __repr__(self) -> str:
        return f"<Organization {self.name}>"
