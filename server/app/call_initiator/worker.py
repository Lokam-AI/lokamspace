"""
Call Initiator Worker - Process service records and calls for each organization.
"""

import asyncio
import logging
import sys
from datetime import datetime, time
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from sqlalchemy.orm import joinedload

from app.core.database import get_engine, async_session_factory
from app.models import Organization, ServiceRecord, Call, ScheduleConfig
from app.services.vapi_service import VAPIService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class CallInitiatorWorker:
    """Worker to process service records and calls for each organization."""
    
    async def _get_db_session(self) -> AsyncSession:
        """Get a database session."""
        engine = get_engine()
        async_session = async_session_factory(bind=engine)
        return async_session
        
    async def start(self):
        """Start the worker and process organizations."""
        print("🚀 Call Initiator Worker starting...")
        
        try:
            async with await self._get_db_session() as db:
                # Get all organizations
                result = await db.execute(select(Organization.name, Organization.id))
                organizations = result.fetchall()
                
                print("📋 All Organizations:")
                if organizations:
                    for i, (org_name, org_id) in enumerate(organizations, 1):
                        print(f"   {i}. {org_name} - ID: {org_id}")
                        
                        # Check if organization is in active time window
                        if await self._is_organization_in_time_window(org_id, org_name, db):
                            # Process service records and calls for this organization
                            await self._process_organization(org_id, org_name, db)
                        else:
                            print(f"   ⏰ Organization {org_name} is not in active time window - skipping calls")
                else:
                    print("   No organizations found.")
                    
        except Exception as e:
            logger.error(f"💥 Error: {str(e)}")
            sys.exit(1)
        finally:
            print("✅ Worker completed")
    
    async def _is_organization_in_time_window(self, org_id, org_name: str, db: AsyncSession) -> bool:
        """Check if organization is in active time window based on schedule config."""
        try:
            # Get schedule configuration for the organization
            schedule_query = select(ScheduleConfig).where(
                and_(
                    ScheduleConfig.organization_id == org_id,
                    ScheduleConfig.campaign_id.is_(None)  # Org-wide config
                )
            )
            schedule_result = await db.execute(schedule_query)
            schedule_config = schedule_result.scalar_one_or_none()
            
            if not schedule_config:
                print(f"   📅 No schedule config found for {org_name} - assuming always active")
                return True
            
            config = schedule_config.config_json
            
            # Check if auto_call_enabled is true
            if not config.get("auto_call_enabled", False):
                print(f"   🚫 Auto call is disabled for {org_name}")
                return False
            
            # Get current time in organization's timezone
            timezone_str = config.get("timezone", "UTC")
            try:
                tz = ZoneInfo(timezone_str)
            except Exception:
                print(f"   ⚠️  Invalid timezone {timezone_str} for {org_name}, using UTC")
                tz = ZoneInfo("UTC")
            
            current_time = datetime.now(tz)
            
            # Check if current day is in active days
            current_day = current_time.strftime("%A").lower()
            active_days = config.get("active_days", [])
            
            if current_day not in active_days:
                print(f"   📅 {org_name} not active on {current_day} (active days: {active_days})")
                return False
            
            # Check if current time is within active hours
            start_time_str = config.get("start_time", "00:00")
            end_time_str = config.get("end_time", "23:59")
            
            try:
                start_time = datetime.strptime(start_time_str, "%H:%M").time()
                end_time = datetime.strptime(end_time_str, "%H:%M").time()
                current_time_only = current_time.time()
                
                # Handle time ranges that span midnight
                if start_time <= end_time:
                    # Normal range (e.g., 09:00 to 17:00)
                    in_time_window = start_time <= current_time_only <= end_time
                else:
                    # Spans midnight (e.g., 22:00 to 06:00)
                    in_time_window = current_time_only >= start_time or current_time_only <= end_time
                
                if in_time_window:
                    print(f"   ✅ {org_name} is in active time window ({start_time_str} - {end_time_str})")
                    return True
                else:
                    print(f"   ⏰ {org_name} not in active time window ({start_time_str} - {end_time_str})")
                    return False
                    
            except ValueError as e:
                print(f"   ⚠️  Invalid time format in schedule config for {org_name}: {e}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error checking time window for {org_name}: {str(e)}")
            return False
    
    async def _process_organization(self, org_id, org_name: str, db: AsyncSession):
        """Process service records and calls for a specific organization."""
        print(f"🔄 Processing organization: {org_name}")
        
        try:
            # Find service records with "Ready" status for this organization
            service_records_query = select(ServiceRecord).where(
                and_(
                    ServiceRecord.organization_id == org_id,
                    ServiceRecord.status == "Ready"
                )
            ).options(joinedload(ServiceRecord.calls))
            
            service_records_result = await db.execute(service_records_query)
            ready_service_records = service_records_result.unique().scalars().all()
            
            if not ready_service_records:
                print(f"   ⏭️  No ready service records found for {org_name}")
                return
            
            print(f"   📋 Found {len(ready_service_records)} ready service records")
            
            # Process each service record
            for i, service_record in enumerate(ready_service_records):
                await self._process_service_record(service_record, org_name, db)
                
                # Add 3-minute delay between calls (except for the last one)
                if i < len(ready_service_records) - 1:
                    print(f"   ⏳ Waiting 3 minutes before next call...")
                    await asyncio.sleep(180)  # 3 minutes = 180 seconds
                
        except Exception as e:
            logger.error(f"❌ Error processing organization {org_name}: {str(e)}")
    
    async def _process_service_record(self, service_record: ServiceRecord, org_name: str, db: AsyncSession):
        """Process a single service record and its associated call."""
        print(f"   📞 Processing service record {service_record.id} for {service_record.customer_name}")
        
        try:
            # Find the associated call with "Ready" status
            call_query = select(Call).where(
                and_(
                    Call.service_record_id == service_record.id,
                    Call.status == "Ready"
                )
            )
            call_result = await db.execute(call_query)
            call = call_result.scalar_one_or_none()
            
            if not call:
                print(f"      ⚠️  No ready call found for service record {service_record.id}")
                return
            
            # Update service record status to "In Progress"
            service_record.status = "In Progress"
            
            # Update call status to "In Progress"
            call.status = "In Progress"
            
            # Commit the status changes
            await db.commit()
            
            print(f"      ✅ Updated status to 'In Progress' for service record {service_record.id} and call {call.id}")
            
            # Trigger VAPI call
            await self._trigger_vapi_call(call, service_record, org_name)
            
        except Exception as e:
            logger.error(f"❌ Error processing service record {service_record.id}: {str(e)}")
            # Rollback on error
            await db.rollback()
    
    async def _trigger_vapi_call(self, call: Call, service_record: ServiceRecord, org_name: str):
        """Trigger VAPI call for the given call and service record."""
        try:
            print(f"      📞 Triggering VAPI call for {service_record.customer_name}")
            
            # Initialize VAPI service
            vapi_service = VAPIService()
            
            # Make the VAPI call
            vapi_response = await vapi_service.create_call(
                phone=service_record.customer_phone,
                customer_name=service_record.customer_name,
                service_advisor_name=service_record.service_advisor_name or "Service Advisor",
                service_type=service_record.service_type or "Service Call",
                organization_name=org_name,
                location="Main Location",  # You might want to get this from organization
                call_id=call.id
            )
            
            print(f"      ✅ VAPI call initiated successfully. VAPI ID: {vapi_response.get('id', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Failed to trigger VAPI call for call {call.id}: {str(e)}")
    
    async def run_single_cycle(self) -> dict:
        """
        Run a single processing cycle (useful for testing and API calls).
        
        Returns:
            Processing statistics
        """
        print("🔄 Running single processing cycle...")
        
        try:
            async with await self._get_db_session() as db:
                # Get all organizations
                result = await db.execute(select(Organization.name, Organization.id))
                organizations = result.fetchall()
                
                stats = {
                    "total_organizations": len(organizations),
                    "organizations_processed": 0,
                    "calls_processed": 0,
                    "calls_initiated": 0,
                    "calls_skipped": 0
                }
                
                if organizations:
                    for org_name, org_id in organizations:
                        # Check if organization is in active time window
                        if await self._is_organization_in_time_window(org_id, org_name, db):
                            # Process service records and calls for this organization
                            org_stats = await self._process_organization_with_stats(org_id, org_name, db)
                            stats["organizations_processed"] += 1
                            stats["calls_processed"] += org_stats.get("calls_processed", 0)
                            stats["calls_initiated"] += org_stats.get("calls_initiated", 0)
                            stats["calls_skipped"] += org_stats.get("calls_skipped", 0)
                        else:
                            stats["calls_skipped"] += 1
                
                print(f"📊 Single cycle completed: {stats}")
                return stats
                
        except Exception as e:
            logger.error(f"💥 Error in single cycle: {str(e)}")
            return {"error": str(e)}
    
    async def _process_organization_with_stats(self, org_id, org_name: str, db: AsyncSession) -> dict:
        """Process organization and return statistics."""
        stats = {
            "calls_processed": 0,
            "calls_initiated": 0,
            "calls_skipped": 0
        }
        
        try:
            # Find service records with "Ready" status for this organization
            service_records_query = select(ServiceRecord).where(
                and_(
                    ServiceRecord.organization_id == org_id,
                    ServiceRecord.status == "Ready"
                )
            ).options(joinedload(ServiceRecord.calls))
            
            service_records_result = await db.execute(service_records_query)
            ready_service_records = service_records_result.unique().scalars().all()
            
            if not ready_service_records:
                return stats
            
            # Process each service record
            for i, service_record in enumerate(ready_service_records):
                call_processed = await self._process_service_record_with_stats(service_record, org_name, db)
                if call_processed:
                    stats["calls_processed"] += 1
                    stats["calls_initiated"] += 1
                else:
                    stats["calls_skipped"] += 1
                
                # Add 3-minute delay between calls (except for the last one)
                if i < len(ready_service_records) - 1:
                    await asyncio.sleep(180)  # 3 minutes = 180 seconds
                
        except Exception as e:
            logger.error(f"❌ Error processing organization {org_name}: {str(e)}")
        
        return stats
    
    async def _process_service_record_with_stats(self, service_record: ServiceRecord, org_name: str, db: AsyncSession) -> bool:
        """Process a single service record and return whether call was processed."""
        try:
            # Find the associated call with "Ready" status
            call_query = select(Call).where(
                and_(
                    Call.service_record_id == service_record.id,
                    Call.status == "Ready"
                )
            )
            call_result = await db.execute(call_query)
            call = call_result.scalar_one_or_none()
            
            if not call:
                return False
            
            # Update service record status to "In Progress"
            service_record.status = "In Progress"
            
            # Update call status to "In Progress"
            call.status = "In Progress"
            
            # Commit the status changes
            await db.commit()
            
            # Trigger VAPI call
            await self._trigger_vapi_call(call, service_record, org_name)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error processing service record {service_record.id}: {str(e)}")
            await db.rollback()
            return False


async def main():
    """Main entry point."""
    worker = CallInitiatorWorker()
    await worker.start()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("🛑 Worker stopped by user")
    except Exception as e:
        logger.error(f"💥 Fatal error: {str(e)}")
        sys.exit(1)