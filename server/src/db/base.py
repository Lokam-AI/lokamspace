from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float, Enum
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class CampaignStatus(enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ServiceStatus(enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    google_review_link = Column(String(255), nullable=True)
    call_quota = Column(Integer)
    location = Column(String(255), nullable=True)
    total_minutes_completed = Column(Integer, default=0)
    area_of_imp_1_title = Column(String(255), nullable=True)
    area_of_imp_1_desc = Column(Text, nullable=True)
    area_of_imp_2_title = Column(String(255), nullable=True)
    area_of_imp_2_desc = Column(Text, nullable=True)
    area_of_imp_3_title = Column(String(255), nullable=True)
    area_of_imp_3_desc = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    users = relationship("User", back_populates="organization")
    campaigns = relationship("Campaign", back_populates="organization")
    service_records = relationship("ServiceRecord", back_populates="organization")
    calls = relationship("Call", back_populates="organization")
    metrics = relationship("OrganizationMetric", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    organization = relationship("Organization", back_populates="users")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    status = Column(Enum(CampaignStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    organization = relationship("Organization", back_populates="campaigns")
    calls = relationship("Call", back_populates="campaign")

class ServiceRecord(Base):
    __tablename__ = "service_records"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    email = Column(String(100))
    service_date = Column(DateTime, nullable=False)
    service_type = Column(String(100))
    service_advisor_name = Column(String(100))
    status = Column(Enum(ServiceStatus), nullable=False)
    attempts = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)
    last_attempt_at = Column(DateTime)
    duration_sec = Column(Integer)
    nps_score = Column(Float)
    overall_feedback = Column(Text)
    transcript = Column(Text)
    recording_url = Column(String(255))
    review_opt_in = Column(Boolean, default=False)
    review_sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    organization = relationship("Organization", back_populates="service_records")
    calls = relationship("Call", back_populates="service_record")

class Call(Base):
    __tablename__ = "calls"
    id = Column(Integer, primary_key=True)
    service_record_id = Column(Integer, ForeignKey("service_records.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    status = Column(Enum(CampaignStatus), nullable=False)
    call_started_at = Column(DateTime)
    call_ended_at = Column(DateTime)
    duration_sec = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    service_record = relationship("ServiceRecord", back_populates="calls")
    organization = relationship("Organization", back_populates="calls")
    campaign = relationship("Campaign", back_populates="calls")
    metric_scores = relationship("CallMetricScore", back_populates="call")

class OrganizationMetric(Base):
    __tablename__ = "organization_metrics"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)  # e.g., Timeliness, Cleanliness, Punctuality
    sort_order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    organization = relationship("Organization", back_populates="metrics")
    call_metric_scores = relationship("CallMetricScore", back_populates="metric")

class CallMetricScore(Base):
    __tablename__ = "call_metric_scores"
    id = Column(Integer, primary_key=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    metric_id = Column(Integer, ForeignKey("organization_metrics.id"), nullable=False)
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer)
    modified_at = Column(DateTime, onupdate=datetime.utcnow)
    modified_by = Column(Integer)

    call = relationship("Call", back_populates="metric_scores")
    metric = relationship("OrganizationMetric", back_populates="call_metric_scores")
