#!/usr/bin/env python3

import sys
import os

# Add the server directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.db.session import SessionLocal
from src.db.base import Organization, User, Customer, ServiceRecord, CallInteraction, Survey, SurveyQuestion, SurveyResponse

def verify_seed_data():
    """Verify that seed data was created successfully"""
    db = SessionLocal()
    
    try:
        print("🔍 Verifying seed data...")
        print("=" * 50)
        
        # Check Organization
        organizations = db.query(Organization).all()
        print(f"📊 Organizations: {len(organizations)}")
        for org in organizations:
            print(f"   - {org.name} (ID: {org.id})")
        
        # Check Users
        users = db.query(User).all()
        print(f"👥 Users: {len(users)}")
        for user in users:
            admin_status = "Admin" if user.is_admin else "User"
            print(f"   - {user.name} ({user.email}) - {admin_status}")
        
        # Check Customers
        customers = db.query(Customer).all()
        print(f"🚗 Customers: {len(customers)}")
        for customer in customers:
            print(f"   - {customer.name} ({customer.vehicle_number}) - {customer.phone}")
        
        # Check Service Records
        service_records = db.query(ServiceRecord).all()
        print(f"🔧 Service Records: {len(service_records)}")
        
        # Check Call Interactions
        call_interactions = db.query(CallInteraction).all()
        print(f"📞 Call Interactions: {len(call_interactions)}")
        status_counts = {}
        for call in call_interactions:
            status_counts[call.status] = status_counts.get(call.status, 0) + 1
        print(f"   Status breakdown: {status_counts}")
        
        # Check Surveys
        surveys = db.query(Survey).all()
        print(f"📝 Surveys: {len(surveys)}")
        
        # Check Survey Questions
        survey_questions = db.query(SurveyQuestion).all()
        print(f"❓ Survey Questions: {len(survey_questions)}")
        for question in survey_questions:
            print(f"   - {question.section}: {question.question_text[:50]}...")
        
        # Check Survey Responses
        survey_responses = db.query(SurveyResponse).all()
        print(f"💬 Survey Responses: {len(survey_responses)}")
        
        print("=" * 50)
        
        if organizations and users and customers:
            print("✅ Seed data verification successful!")
            print(f"\n🎯 Summary:")
            print(f"   • Organization '{organizations[0].name}' created")
            print(f"   • Admin user '{users[0].name}' ready to login")
            print(f"   • {len(customers)} customers with diverse service data")
            print(f"   • {len(call_interactions)} call interactions with different statuses")
            print(f"   • {len(surveys)} completed surveys with responses")
            
            print(f"\n🔐 Login Credentials:")
            print(f"   Email: raoofnaushad.7@gmail.com")
            print(f"   Password: Lokam@7007")
        else:
            print("❌ Seed data verification failed!")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if verify_seed_data():
        sys.exit(0)
    else:
        sys.exit(1) 