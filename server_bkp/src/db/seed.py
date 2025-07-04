from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from .session import SessionLocal
from .base import (
    Organization, User, Campaign, ServiceRecord, 
    Call, OrganizationMetric, CallMetricScore,
    UserRole, CampaignStatus, ServiceStatus
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
            google_review_link="https://g.page/r/lokam-ai",
            call_quota=1000,
            location="Silicon Valley, CA",
            total_minutes_completed=0,
            area_of_imp_1_title="Timeliness",
            area_of_imp_1_desc="Good Timeliness",
            area_of_imp_2_title="Service Quality",
            area_of_imp_2_desc="Enhance service quality metrics",
            area_of_imp_3_title="Response Time",
            area_of_imp_3_desc="Reduce average response time",
            created_at=datetime.utcnow() - timedelta(days=365),
            created_by=1
        )
        db.add(organization)
        db.flush()
        
        logger.info(f"Created organization: {organization.name}")
        
        # 2. Create User (Admin)
        password_hash = get_password_hash("123456")
        user = User(
            organization_id=organization.id,
            name="test",
            email="test@gmail.com",
            password_hash=password_hash,
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.utcnow() - timedelta(days=300),
            created_by=1
        )
        db.add(user)
        db.flush()
        
        logger.info(f"Created admin user: {user.name}")

        # 3. Create Organization Metrics
        metrics_data = [
            {"name": "Timeliness", "sort_order": 1},
            {"name": "Cleanliness", "sort_order": 2},
            {"name": "Punctuality", "sort_order": 3},
            {"name": "Service Quality", "sort_order": 4},
            {"name": "Customer Satisfaction", "sort_order": 5}
        ]

        metrics = []
        for metric_data in metrics_data:
            metric = OrganizationMetric(
                organization_id=organization.id,
                name=metric_data["name"],
                sort_order=metric_data["sort_order"],
                created_at=datetime.utcnow(),
                created_by=user.id
            )
            metrics.append(metric)
            db.add(metric)
        
        db.flush()
        logger.info(f"Created {len(metrics)} organization metrics")

        # 4. Create Campaign
        campaign = Campaign(
            name="Q1 2024 Customer Satisfaction",
            description="Customer satisfaction survey campaign for Q1 2024",
            organization_id=organization.id,
            started_at=datetime.utcnow() - timedelta(days=30),
            status=CampaignStatus.IN_PROGRESS,
            created_at=datetime.utcnow() - timedelta(days=30),
            created_by=user.id
        )
        db.add(campaign)
        db.flush()
        
        logger.info(f"Created campaign: {campaign.name}")

        # 5. Create Service Records
        service_types = ["Oil Change", "Brake Service", "Tire Replacement", "Engine Diagnosis", "AC Repair"]
        service_records = []
        
        for i in range(10):  # Create 10 service records
            service_date = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            service_type = random.choice(service_types)
            
            service_record = ServiceRecord(
                organization_id=organization.id,
                customer_name=f"Customer {i+1}",
                phone=f"9029897{str(i).zfill(3)}",
                email=f"customer{i+1}@example.com",
                service_date=service_date,
                service_type=service_type,
                service_advisor_name="John Advisor",
                status=ServiceStatus.COMPLETED,
                attempts=1,
                duration_sec=random.randint(300, 900),
                nps_score=random.randint(7, 10),
                overall_feedback=f"Great service experience with {service_type}",
                transcript=f"Customer was satisfied with the {service_type} service",
                review_opt_in=True,
                created_at=service_date,
                created_by=user.id
            )
            service_records.append(service_record)
            db.add(service_record)
        
        db.flush()
        logger.info(f"Created {len(service_records)} service records")

        # 6. Create Calls and Call Metric Scores
        calls = []
        for service_record in service_records:
            call = Call(
                service_record_id=service_record.id,
                organization_id=organization.id,
                campaign_id=campaign.id,
                status=CampaignStatus.COMPLETED,
                call_started_at=service_record.service_date + timedelta(days=1),
                call_ended_at=service_record.service_date + timedelta(days=1, minutes=random.randint(5, 15)),
                duration_sec=random.randint(300, 900),
                created_at=service_record.service_date + timedelta(days=1),
                created_by=user.id
            )
            calls.append(call)
            db.add(call)
            db.flush()

            # Create metric scores for each call
            for metric in metrics:
                score = CallMetricScore(
                    call_id=call.id,
                    metric_id=metric.id,
                    organization_id=organization.id,
                    created_at=call.created_at,
                    created_by=user.id
                )
                db.add(score)
        
        db.flush()
        logger.info(f"Created {len(calls)} calls with metric scores")

        # Commit all data
        db.commit()
        logger.info("Seed data created successfully!")
        
        # Print summary
        print("\n" + "="*50)
        print("SEED DATA SUMMARY")
        print("="*50)
        print(f"Organization: {organization.name}")
        print(f"Admin User: {user.name} ({user.email})")
        print(f"Organization Metrics: {len(metrics)}")
        print(f"Campaign: {campaign.name}")
        print(f"Service Records: {len(service_records)}")
        print(f"Calls: {len(calls)}")
        print("="*50)
        
    except Exception as e:
        logger.error(f"Error creating seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_seed_data()
