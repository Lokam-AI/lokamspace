#!/usr/bin/env python
"""
Test script for call analysis service.
This script processes a call analysis for a specific call ID.
"""

import asyncio
import sys
import os
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.call_analysis_service import CallAnalysisService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Hardcoded database URL - replace with your actual database URL
DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/autopulse"

# Create async engine and session
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def test_call_analysis(call_id: int):
    """
    Test the call analysis service for a specific call ID.
    
    Args:
        call_id: The ID of the call to analyze
    """
    logger.info(f"Testing call analysis for call ID: {call_id}")
    
    async with async_session() as db:
        try:
            # Trigger the call analysis
            result = await CallAnalysisService.trigger_after_call_analysis(call_id, db)
            
            # Log the result
            if result.get("status") == "success":
                logger.info("Call analysis completed successfully")
                logger.info(f"Analysis result: {result.get('analysis')}")
            else:
                logger.error(f"Call analysis failed: {result.get('message')}")
                
        except Exception as e:
            logger.error(f"Error during call analysis: {str(e)}")

async def main():
    """Main function to run the test."""
    if len(sys.argv) != 2:
        logger.error("Usage: python test_call_analysis.py <call_id>")
        sys.exit(1)
    
    try:
        call_id = int(sys.argv[1])
    except ValueError:
        logger.error("Call ID must be an integer")
        sys.exit(1)
    
    await test_call_analysis(call_id)

if __name__ == "__main__":
    asyncio.run(main()) 