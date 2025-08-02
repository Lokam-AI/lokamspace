#!/usr/bin/env python3
"""
Daily activity generation script for cron automation.

This script generates daily activities for all organizations and caches them
for display on the dashboard. It should be run once per day via cron.

Example crontab entry:
0 0 * * * /path/to/python /path/to/lokamspace/server/scripts/generate_daily_activities.py
"""

import asyncio
import logging
import sys
from datetime import date, timedelta
from pathlib import Path

# Add the server directory to the Python path
server_dir = Path(__file__).parent.parent
sys.path.insert(0, str(server_dir))

from app.core.database import get_async_session
from app.services.activity_service import ActivityService
from app.models import Organization
from sqlalchemy import select

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('daily_activities.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


async def generate_activities_for_all_organizations():
    """Generate activities for all organizations."""
    
    logger.info("Starting daily activity generation...")
    
    try:
        async for db in get_async_session():
            # Get all organizations
            org_query = select(Organization)
            org_result = await db.execute(org_query)
            organizations = list(org_result.scalars().all())
            
            logger.info(f"Found {len(organizations)} organizations")
            
            # Generate activities for yesterday for each organization
            yesterday = date.today() - timedelta(days=1)
            
            for org in organizations:
                try:
                    logger.info(f"Generating activities for organization: {org.name} ({org.id})")
                    
                    # Generate and cache activities
                    activities = await ActivityService.get_recent_activities(
                        db=db,
                        organization_id=org.id,
                        date_for=yesterday,
                        limit=5
                    )
                    
                    logger.info(
                        f"Generated {len(activities)} activities for {org.name}: "
                        f"{[activity['title'] for activity in activities]}"
                    )
                    
                except Exception as e:
                    logger.error(f"Error generating activities for organization {org.name}: {str(e)}")
                    continue
            
            logger.info(f"Successfully generated activities for {len(organizations)} organizations")
            break  # Exit after first session
            
    except Exception as e:
        logger.error(f"Error in activity generation: {str(e)}")
        raise


async def main():
    """Main function."""
    try:
        await generate_activities_for_all_organizations()
        logger.info("Daily activity generation completed successfully")
        return 0
    except Exception as e:
        logger.error(f"Daily activity generation failed: {str(e)}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 