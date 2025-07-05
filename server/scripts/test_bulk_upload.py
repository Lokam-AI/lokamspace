#!/usr/bin/env python
"""
Script to test bulk upload functionality.
"""
import asyncio
import logging
import sys
import uuid
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Add parent directory to path so we can import from app
sys.path.insert(0, ".")

async def test_bulk_upload():
    """Test bulk upload functionality."""
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
    from sqlalchemy.orm import sessionmaker
    from app.models.campaign import Campaign
    from app.services.call_service import CallService
    from app.core.config import settings
    
    # Create test database engine and session
    engine = create_async_engine(settings.POSTGRES_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Create fake data
    organization_id = uuid.UUID("1f009394-0b17-42f3-a10d-04d77ddb0518")  # Replace with a real org ID
    campaign_name = f"Test Campaign {uuid.uuid4()}"
    user_id = 1  # Replace with a real user ID
    
    # Create sample calls data
    calls_data = [
        {
            "customer_name": "John Doe",
            "customer_number": "+19029897685",
            "vehicle_info": "2019 Honda Civic",
            "service_type": "Oil Change",
            "call_reason": "Service follow-up",
            "service_advisor_name": "Mike Smith"
        },
        {
            "customer_name": "Jane Smith",
            "customer_number": "9029897686",  # Test auto-adding "+"
            "vehicle_info": "2020 Toyota Camry",
            "service_type": "Brake Service",
            "call_reason": "Service follow-up",
            "service_advisor_name": "John Johnson"
        }
    ]
    
    # Test bulk upload
    try:
        async with async_session() as session:
            # Delete existing campaign if it exists
            from sqlalchemy import delete, select
            from app.models.call import Call
            
            try:
                # Check if campaign exists
                result = await session.execute(
                    select(Campaign).where(Campaign.name == campaign_name)
                )
                existing_campaign = result.scalar_one_or_none()
                
                if existing_campaign:
                    # Delete associated calls first
                    await session.execute(
                        delete(Call).where(Call.campaign_id == existing_campaign.id)
                    )
                    # Then delete the campaign
                    await session.delete(existing_campaign)
                    await session.commit()
                    logger.info(f"Deleted existing campaign: {campaign_name}")
            except Exception as e:
                logger.error(f"Error checking/deleting campaign: {e}")
                await session.rollback()
            
            # Now run the bulk upload
            result = await CallService.bulk_upload_calls(
                organization_id=organization_id,
                campaign_name=campaign_name,
                calls_data=calls_data,
                db=session,
                current_user_id=user_id
            )
            
            logger.info(f"Bulk upload result: {result}")
            
            # Verify campaign was created
            campaign_result = await session.execute(
                select(Campaign).where(
                    Campaign.name == campaign_name,
                    Campaign.organization_id == organization_id
                )
            )
            campaign = campaign_result.scalar_one_or_none()
            
            if campaign:
                logger.info(f"Campaign created successfully: {campaign.id}")
                
                # Verify calls were created
                from app.models.call import Call
                calls_result = await session.execute(
                    select(Call).where(Call.campaign_id == campaign.id)
                )
                calls = list(calls_result.scalars().all())
                
                logger.info(f"Number of calls created: {len(calls)}")
                for call in calls:
                    logger.info(f"Call: {call.id}, Status: {call.status}, Number: {call.customer_number}")
                    
                    # Verify service record was created
                    if call.service_record_id:
                        from app.models.service_record import ServiceRecord
                        sr_result = await session.execute(
                            select(ServiceRecord).where(ServiceRecord.id == call.service_record_id)
                        )
                        sr = sr_result.scalar_one_or_none()
                        if sr:
                            logger.info(f"Service record: {sr.id}, Vehicle: {sr.vehicle_info}")
            else:
                logger.error("Campaign was not created")
            
    except Exception as e:
        logger.error(f"Error testing bulk upload: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_bulk_upload()) 