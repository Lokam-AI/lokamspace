#!/usr/bin/env python3

import sys
import os

# Add the server directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.db.session import SessionLocal
from src.db.base import Base, Organization, User, Customer, ServiceRecord, CallInteraction, Survey, SurveyQuestion, SurveyResponse
from src.db.session import engine
from src.db.seed import create_seed_data

def reset_database():
    """Reset the database by dropping and recreating all tables"""
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("🏗️  Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ Database reset complete!")

def main():
    print("🚀 Starting database reset and seed data creation...")
    print("=" * 60)
    
    try:
        # Reset the database
        reset_database()
        
        # Create seed data
        print("\n📊 Creating seed data...")
        create_seed_data()
        
        print("\n✅ Process completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during process: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 