from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class ServiceRecord(Base):
    __tablename__ = "service_records"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    service_date = Column(DateTime, nullable=False)
    service_details = Column(Text)
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(50), nullable=False, default="pending")

    customer = relationship("Customer", back_populates="service_records")
    assigned_user = relationship("User")
    call_interactions = relationship("CallInteraction", back_populates="service_record")

class CallInteraction(Base):
    __tablename__ = "call_interactions"
    id = Column(Integer, primary_key=True)
    service_record_id = Column(Integer, ForeignKey("service_records.id"), nullable=False)
    call_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50))
    duration_seconds = Column(Integer)
    transcription = Column(Text)
    overall_feedback = Column(Text)
    overall_score = Column(Float)
    timeliness_score = Column(Float)
    cleanliness_score = Column(Float)
    advisor_helpfulness_score = Column(Float)
    work_quality_score = Column(Float)
    recommendation_score = Column(Float)
    action_items = Column(Text)
    completed_at = Column(DateTime)

    service_record = relationship("ServiceRecord", back_populates="call_interactions") 