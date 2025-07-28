"""
Script to run the daily activities generation process.
This should be set up as a cron job to run once per day.

Example crontab entry:
0 0 * * * /path/to/python /path/to/lokamspace/server/scripts/generate_daily_activities.py
"""

import asyncio
import logging
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add the parent directory to the path so we can import the app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_async_session, init_db
from app.models import Organization
from app.services.activity_service import ActivityService

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(), logging.FileHandler(f"{Path(__file__).parent}/daily_activities.log")]
)
logger = logging.getLogger(__name__)


async def generate_activities_for_organization(organization_id: str, db: AsyncSession) -> None:
    """Generate activities for a single organization"""
    logger.info(f"Generating activities for organization {organization_id}")
    
    yesterday = datetime.now().date() - timedelta(days=1)
    try:
        # Use the ActivityService to get the activities
        activities = await ActivityService.get_recent_activities(
            db=db,
            organization_id=organization_id,
            date_for=yesterday
        )
        
        logger.info(f"Generated {len(activities)} activities for organization {organization_id}")
    except Exception as e:
        logger.error(f"Error generating activities for organization {organization_id}: {e}")


async def main():
    """Main entry point for the script"""
    logger.info("Starting daily activities generation process")
    
    # Initialize the database connection
    await init_db()
    
    # Create a database session
    async for db in get_async_session():
        try:
            # Get all organizations
            from sqlalchemy import select
            query = select(Organization)
            result = await db.execute(query)
            organizations = result.scalars().all()
            
            # Generate activities for each organization
            for org in organizations:
                await generate_activities_for_organization(org.id, db)
            
            logger.info(f"Completed activities generation for {len(organizations)} organizations")
        except Exception as e:
            logger.error(f"Error in activities generation process: {e}")
            raise
        finally:
            await db.close()
    
    logger.info("Daily activities generation process completed")


if __name__ == "__main__":
    asyncio.run(main())
