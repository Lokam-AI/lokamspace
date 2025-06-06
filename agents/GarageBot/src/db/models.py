from datetime import datetime
from typing import Optional
from sqlalchemy import ForeignKey, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import (
    Column, Integer, String, DateTime, Text, Boolean
)

from .base import Base

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)
    address = Column(Text)

    users = relationship("User", back_populates="organization",
                         cascade="all, delete")
    customers = relationship("Customer", back_populates="organization",
                             cascade="all, delete")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id"))
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(120))
    hashed_pw = Column(String(255))

    organization = relationship("Organization", back_populates="users")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    org_id = Column(Integer, ForeignKey("organizations.id"))
    name = Column(String(120), nullable=False)
    phone = Column(String(50))
    vehicle_vin = Column(String(64))
    last_service = Column(DateTime)

    organization = relationship("Organization", back_populates="customers")
    services = relationship("ServiceRecord", back_populates="customer",
                            cascade="all, delete")

class ServiceRecord(Base):
    __tablename__ = "service_records"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    service_date = Column(DateTime, default=datetime.utcnow)
    odometer = Column(Integer)
    invoice_amount = Column(Integer)

    customer = relationship("Customer", back_populates="services")
    calls = relationship("CallInteraction", back_populates="service_record",
                         cascade="all, delete")

class CallInteraction(Base):
    __tablename__ = "call_interactions"
    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("service_records.id"))
    session_id = Column(String(36), unique=True, nullable=False)
    call_started = Column(DateTime, default=datetime.utcnow)
    call_ended = Column(DateTime)
    transcription = Column(Text)
    summary = Column(Text)
    disconnect_reason = Column(String(50))
    metrics = Column(JSON)
    status = Column(String(50))

    service_record = relationship("ServiceRecord", back_populates="calls")
    feedback = relationship("Feedback", uselist=False,
                            back_populates="call_interaction")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    subject = Column(String(64), nullable=False)
    text = Column(Text, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    feedbacks = relationship("Feedback", back_populates="question")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True)
    call_id = Column(Integer, ForeignKey("call_interactions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    score = Column(Integer)
    sentiment = Column(String(16))
    key_points = Column(Text)
    tone = Column(String(16))
    comments = Column(Text)

    call_interaction = relationship("CallInteraction", back_populates="feedback")
    question = relationship("Question", back_populates="feedbacks") 