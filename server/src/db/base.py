from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Boolean, Float
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    users = relationship("User", back_populates="organization")
    customers = relationship("Customer", back_populates="organization")
    is_active = Column(Boolean, default=True)
    survey_questions = relationship("SurveyQuestion", back_populates="organization")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.populate_default_questions()

    def populate_default_questions(self):
        default_questions = [
            "How would you rate your overall service experience?",
            "Was the service completed on time?",
            "How would you rate the cleanliness of your vehicle after service?",
            "How would you rate the helpfulness and information provided by the service advisor?",
            "How would you rate the quality of the work performed on your vehicle?",
            "How likely are you to recommend our dealership to others?"
        ]
        for question_text in default_questions:
            question = SurveyQuestion(question_text=question_text, organization=self)
            self.survey_questions.append(question)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100))
    phone = Column(String(20))
    vehicle_number = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="customers")
    service_records = relationship("ServiceRecord", back_populates="customer")


class ServiceRecord(Base):
    __tablename__ = "service_records"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    service_date = Column(DateTime, nullable=False)
    service_details = Column(Text)
    assigned_user_id = Column(Integer, ForeignKey("users.id"))  # Service advisor/staff member
    # Add more fields: type, advisor, etc.

    customer = relationship("Customer", back_populates="service_records")
    assigned_user = relationship("User")
    call_interactions = relationship("CallInteraction", back_populates="service_record")


class CallInteraction(Base):
    __tablename__ = "call_interactions"
    id = Column(Integer, primary_key=True)
    service_record_id = Column(Integer, ForeignKey("service_records.id"), nullable=False)
    call_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50))  # e.g. 'completed', 'failed', 'in-progress'
    duration_seconds = Column(Integer)
    transcription = Column(Text)
    # Add more call metrics as needed

    service_record = relationship("ServiceRecord", back_populates="call_interactions")
    survey = relationship("Survey", back_populates="call_interaction", uselist=False)


class Survey(Base):
    __tablename__ = "surveys"
    id = Column(Integer, primary_key=True)
    call_interaction_id = Column(Integer, ForeignKey("call_interactions.id"), unique=True, nullable=False)
    overall_feedback = Column(Text)
    overall_score = Column(Float)
    timeliness_score = Column(Float)
    cleanliness_score = Column(Float)
    advisor_helpfulness_score = Column(Float)
    work_quality_score = Column(Float)
    recommendation_score = Column(Float)
    action_items = Column(Text)
    completed_at = Column(DateTime, default=datetime.utcnow)

    call_interaction = relationship("CallInteraction", back_populates="survey")
    responses = relationship("SurveyResponse", back_populates="survey")


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"
    id = Column(Integer, primary_key=True)
    question_text = Column(Text, nullable=False)
    section = Column(String(50))  # e.g., 'timeliness', 'cleanliness'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    organization = relationship("Organization", back_populates="survey_questions")
    responses = relationship("SurveyResponse", back_populates="question")


class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    id = Column(Integer, primary_key=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("survey_questions.id"), nullable=False)
    response = Column(Text)
    score = Column(Float)

    survey = relationship("Survey", back_populates="responses")
    question = relationship("SurveyQuestion", back_populates="responses")
