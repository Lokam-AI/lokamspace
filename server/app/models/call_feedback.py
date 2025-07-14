"""
Call Feedback model for storing customer call feedback data.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import relationship

from .base import Base


class CallFeedback(Base):
    """
    CallFeedback model for storing detailed feedback from call analyses.
    """
    
    # Table name - explicitly set
    __tablename__ = "call_feedback"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Call relationship - ensure we reference the correct table name
    call_id = Column(Integer, ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # New feedback fields
    kpis = Column(JSON, nullable=True)  # Store KPIs as a JSON object
    type = Column(String(20), nullable=True)  # Can have values like "positives", "detractors", etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    call = relationship("Call", back_populates="feedback")
    
    def __repr__(self) -> str:
        """String representation of the model."""
        return f"<CallFeedback id={self.id} call_id={self.call_id}>" 