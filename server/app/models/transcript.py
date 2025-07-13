"""
Transcript model for call transcript segments.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy.orm import relationship

from .base import Base


class Transcript(Base):
    """
    Transcript model for storing call transcript segments.
    """
    
    # Table name - explicitly set
    __tablename__ = "transcripts"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Call relationship
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), nullable=False)
    
    # Speaker role (User, Assistant, Tool)
    role = Column(String(50), nullable=False)
    
    # Transcript content - renamed to match database column name
    message = Column(Text, nullable=False)
    
    # Time information - match database schema
    time = Column(Float, nullable=True)  # Seconds from call start
    end_time = Column(Float, nullable=True)  # End time in seconds from call start
    duration = Column(Float, nullable=True)  # Duration of this message in seconds
    
    # Timestamps for record creation/update
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default="now()", nullable=False)
    
    # Relationships
    call = relationship("Call", back_populates="transcript")
    
    def __repr__(self) -> str:
        return f"<Transcript {self.id}: {self.role}>"
