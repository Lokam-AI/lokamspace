"""
Transcript model for call transcript segments.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import Base


class Transcript(Base):
    """
    Transcript model for storing call transcript segments.
    """
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Call relationship
    call_id = Column(Integer, ForeignKey("call.id"), nullable=False)
    
    # Speaker role (User, Assistant, Tool)
    role = Column(String(20), nullable=False)
    
    # Transcript content
    content = Column(Text, nullable=False)
    
    # Timestamp for this segment
    timestamp = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    call = relationship("Call", back_populates="transcript")
    
    def __repr__(self) -> str:
        return f"<Transcript {self.id}: {self.role} at {self.timestamp}>"
