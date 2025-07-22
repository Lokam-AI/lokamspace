"""
Call model for phone call records.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Call(Base):
    """
    Call model for tracking customer phone calls.
    """
    
    # Table name - explicitly set
    __tablename__ = "calls"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Organization (tenant) relationship
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )
    
    # ServiceRecord relationship
    service_record_id = Column(Integer, ForeignKey("servicerecords.id"), nullable=True)
    
    # Campaign relationship
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    
    # User (agent) relationship
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Call details
    customer_number = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False, default="outbound")  # outbound, inbound
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_sec = Column(Integer)
    
    # Status (e.g., "Completed", "Missed", "Scheduled", "In Progress")
    status = Column(String(20), nullable=False)
    
    # Recording information
    recording_url = Column(Text)
    
    # Added fields for feedback calls
    nps_score = Column(Integer, nullable=True)
    call_reason = Column(String(100), nullable=True)
    feedback_summary = Column(Text, nullable=True)
    
    # New field - call summary
    call_summary = Column(Text, nullable=True)
    
    # Fields from VAPI migration
    call_ended_at = Column(DateTime(timezone=True), nullable=True)
    cost = Column(Numeric(10, 4), nullable=True)  # Changed from Float to Numeric for precision
    
    # New fields for VAPI integration
    vapi_call_id = Column(String(100), nullable=True)  # VAPI's call ID
    ended_reason = Column(String(50), nullable=True)  # Reason for call ending
    duration_ms = Column(Integer, nullable=True)  # Duration in milliseconds
    
    # Relationships
    organization = relationship("Organization", back_populates="calls")
    service_record = relationship("ServiceRecord", back_populates="calls")
    campaign = relationship("Campaign", back_populates="calls")
    agent = relationship("User", foreign_keys=[agent_id])
    transcript = relationship("Transcript", back_populates="call")
    audio_file = relationship("AudioFile", back_populates="call", uselist=False)
    feedback = relationship("CallFeedback", back_populates="call", uselist=False)
    
    def __repr__(self) -> str:
        return f"<Call {self.id}: {self.customer_number} - {self.status}>"
