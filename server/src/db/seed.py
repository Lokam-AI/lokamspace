from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from .session import SessionLocal
from .base import (
    Organization, User, Customer, ServiceRecord, 
    CallInteraction, Survey, SurveyQuestion, SurveyResponse
)
from ..core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

def create_seed_data():
    """Create seed data for the application"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Organization).first():
            logger.info("Seed data already exists, skipping...")
            return
        
        logger.info("Creating seed data...")
        
        # 1. Create Organization
        organization = Organization(
            name="Lokam.ai",
            address="123 Innovation Drive, Tech Park, Silicon Valley, CA 94043",
            created_at=datetime.utcnow() - timedelta(days=365)
        )
        db.add(organization)
        db.flush()  # Get the ID
        
        # Create default survey questions for the organization
        organization.populate_default_questions(db)
        db.flush()
        
        logger.info(f"Created organization: {organization.name}")
        
        # 2. Create User (Admin)
        password_hash, salt = get_password_hash("Lokam@7007")
        user = User(
            organization_id=organization.id,
            name="Raoof Naushad",
            email="raoofnaushad.7@gmail.com",
            password_hash=password_hash,
            salt=salt,
            is_active=True,
            is_admin=True,
            created_at=datetime.utcnow() - timedelta(days=300)
        )
        db.add(user)
        db.flush()
        
        logger.info(f"Created admin user: {user.name}")
        
        # 3. Create Customers
        customers_data = [
            {
                "name": "John Smith",
                "email": "john.smith@email.com",
                "vehicle_number": "ABC-1234"
            },
            {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@gmail.com",
                "vehicle_number": "XYZ-5678"
            },
            {
                "name": "Michael Brown",
                "email": "michael.brown@yahoo.com",
                "vehicle_number": "DEF-9012"
            }
        ]
        
        customers = []
        for i, customer_data in enumerate(customers_data):
            customer = Customer(
                organization_id=organization.id,
                name=customer_data["name"],
                email=customer_data["email"],
                phone="9029897685",
                vehicle_number=customer_data["vehicle_number"],
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=200 - i*30)
            )
            customers.append(customer)
            db.add(customer)
        
        db.flush()
        logger.info(f"Created {len(customers)} customers")
        
        # 4. Create Service Records and Call Interactions for each customer
        call_statuses = ["completed", "failed", "in-progress"]
        service_types = ["Oil Change", "Brake Service", "Tire Replacement", "Engine Diagnosis", "AC Repair"]
        
        surveys = []
        for i, customer in enumerate(customers):
            # Create 2-3 service records per customer
            num_services = random.randint(2, 3)
            
            for j in range(num_services):
                service_date = datetime.utcnow() - timedelta(days=150 - (i*30) - (j*15))
                
                service_record = ServiceRecord(
                    customer_id=customer.id,
                    vehicle_number=customer.vehicle_number,
                    service_date=service_date,
                    service_details=f"{random.choice(service_types)} - Completed routine maintenance and inspection",
                    assigned_user_id=user.id
                )
                db.add(service_record)
                db.flush()
                
                # Create Call Interaction for this service record
                call_status = call_statuses[j % len(call_statuses)]  # Rotate through statuses
                call_date = service_date + timedelta(days=1)
                
                call_interaction = CallInteraction(
                    service_record_id=service_record.id,
                    call_date=call_date,
                    status=call_status,
                    duration_seconds=random.randint(120, 480),  # 2-8 minutes
                    transcription=f"Customer satisfaction call for {customer.name}. Discussed {service_record.service_details.split(' - ')[0].lower()} service experience."
                )
                db.add(call_interaction)
                db.flush()
                
                # Create Survey for completed calls
                if call_status == "completed":
                    # Generate realistic scores
                    overall_score = random.uniform(3.5, 5.0)
                    timeliness_score = random.uniform(3.0, 5.0)
                    cleanliness_score = random.uniform(3.2, 5.0)
                    advisor_score = random.uniform(3.8, 5.0)
                    work_quality_score = random.uniform(3.5, 5.0)
                    recommendation_score = random.uniform(3.0, 5.0)
                    
                    survey = Survey(
                        call_interaction_id=call_interaction.id,
                        overall_feedback=f"Great service experience at Lokam.ai. The {service_record.service_details.split(' - ')[0].lower()} was handled professionally.",
                        overall_score=round(overall_score, 1),
                        timeliness_score=round(timeliness_score, 1),
                        cleanliness_score=round(cleanliness_score, 1),
                        advisor_helpfulness_score=round(advisor_score, 1),
                        work_quality_score=round(work_quality_score, 1),
                        recommendation_score=round(recommendation_score, 1),
                        action_items="Follow up on warranty information" if random.random() < 0.3 else None,
                        completed_at=call_date + timedelta(minutes=random.randint(5, 30))
                    )
                    db.add(survey)
                    surveys.append(survey)
        
        db.flush()
        logger.info(f"Created service records and call interactions")
        
        # 5. Create Survey Responses for each survey
        # Get the survey questions that were created for the organization
        survey_questions = db.query(SurveyQuestion).filter(
            SurveyQuestion.organization_id == organization.id
        ).all()
        
        for survey in surveys:
            for question in survey_questions:
                # Generate responses based on question type
                if "overall" in question.section.lower():
                    response_text = "Very satisfied with the overall service quality"
                    score = survey.overall_score
                elif "timeliness" in question.section.lower():
                    response_text = "Service was completed on time" if survey.timeliness_score >= 4 else "Service took longer than expected"
                    score = survey.timeliness_score
                elif "cleanliness" in question.section.lower():
                    response_text = "Vehicle was returned in clean condition"
                    score = survey.cleanliness_score
                elif "helpfulness" in question.section.lower():
                    response_text = "Service advisor was very helpful and informative"
                    score = survey.advisor_helpfulness_score
                elif "quality" in question.section.lower():
                    response_text = "Work quality met my expectations"
                    score = survey.work_quality_score
                elif "recommendation" in question.section.lower():
                    response_text = "Would recommend to others" if survey.recommendation_score >= 4 else "Might recommend with some reservations"
                    score = survey.recommendation_score
                else:
                    response_text = "Good experience overall"
                    score = survey.overall_score
                
                survey_response = SurveyResponse(
                    survey_id=survey.id,
                    question_id=question.id,
                    response=response_text,
                    score=score
                )
                db.add(survey_response)
        
        # Commit all data
        db.commit()
        logger.info("Seed data created successfully!")
        
        # Print summary
        print("\n" + "="*50)
        print("SEED DATA SUMMARY")
        print("="*50)
        print(f"Organization: {organization.name}")
        print(f"Admin User: {user.name} ({user.email})")
        print(f"Customers: {len(customers)}")
        print(f"Service Records: {db.query(ServiceRecord).count()}")
        print(f"Call Interactions: {db.query(CallInteraction).count()}")
        print(f"Surveys: {len(surveys)}")
        print(f"Survey Questions: {len(survey_questions)}")
        print(f"Survey Responses: {db.query(SurveyResponse).count()}")
        print("="*50)
        
    except Exception as e:
        logger.error(f"Error creating seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
