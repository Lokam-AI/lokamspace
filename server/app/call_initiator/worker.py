"""
Call Initiator Worker - Process service records and calls for each organization.
"""

import asyncio
import logging
import sys
from datetime import datetime, time
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update, func
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
                # Check current "In Progress" calls count
                in_progress_count = await self._get_in_progress_calls_count(db)
                print(f"📊 Current 'In Progress' calls: {in_progress_count}")
                
                if in_progress_count > 5:
                    print("⚠️  Too many concurrent calls (>5). Holding service and waiting for next run.")
                    return
                
                # If In Progress calls <= 5, proceed with processing
                if in_progress_count <= 5:
                    # First, queue calls for organizations
                    await self._queue_calls_for_organizations(db)
                    
                    # Then process queued calls by making them In Progress and initiating VAPI calls
                    await self._process_queued_calls(db)
                    
        except Exception as e:
            logger.error(f"💥 Error: {str(e)}")
            sys.exit(1)
        finally:
            print("✅ Worker completed")
    
    async def _get_in_progress_calls_count(self, db: AsyncSession) -> int:
        """Get the count of calls with 'In Progress' status."""
        try:
            result = await db.execute(
                select(func.count(Call.id)).where(Call.status == "In Progress")
            )
            return result.scalar() or 0
        except Exception as e:
            logger.error(f"❌ Error getting in progress calls count: {str(e)}")
            return 0
    
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
                print(f"   📅 No schedule config found for {org_name} - returning False")
                return False
            
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
    
    async def _queue_calls_for_organizations(self, db: AsyncSession):
        """Queue calls for all organizations that are in active time window."""
        print("🔄 Queuing calls for organizations...")
        
        try:
            # Get all organizations
            result = await db.execute(select(Organization.name, Organization.id))
            organizations = result.fetchall()
            
            print("📋 All Organizations:")
            if organizations:
                for i, (org_name, org_id) in enumerate(organizations, 1):
                    print(f"   {i}. {org_name} - ID: {org_id}")
                    
                    # Check if organization is in active time window
                    if await self._is_organization_in_time_window(org_id, org_name, db):
                        # Queue call for this organization
                        await self._queue_call_for_organization(org_id, org_name, db)
                    else:
                        print(f"   ⏰ Organization {org_name} is not in active time window - skipping calls")
            else:
                print("   No organizations found.")
                
        except Exception as e:
            logger.error(f"❌ Error queuing calls for organizations: {str(e)}")
    
    async def _queue_call_for_organization(self, org_id, org_name: str, db: AsyncSession):
        """Queue a call for a specific organization."""
        print(f"🔄 Queuing call for organization: {org_name}")
        
        try:
            # Check if we already have a "Queued" call for this organization
            queued_call_query = select(Call).join(Call.service_record).where(
                and_(
                    ServiceRecord.organization_id == org_id,
                    Call.status == "Queued"
                )
            )
            queued_result = await db.execute(queued_call_query)
            queued_call = queued_result.scalar_one_or_none()
            
            if queued_call:
                print(f"   ⏳ Organization {org_name} already has a queued call - skipping")
                return
            
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
            
            # Take the first ready service record and queue its call
            first_service_record = ready_service_records[0]
            await self._queue_service_record_call(first_service_record, org_name, db)
                
        except Exception as e:
            logger.error(f"❌ Error queuing call for organization {org_name}: {str(e)}")
    
    async def _process_organization(self, org_id, org_name: str, db: AsyncSession):
        """Process service records and calls for a specific organization."""
        print(f"🔄 Processing organization: {org_name}")
        
        try:
            # Check if we already have a "Queued" call for this organization
            queued_call_query = select(Call).join(Call.service_record).where(
                and_(
                    ServiceRecord.organization_id == org_id,
                    Call.status == "Queued"
                )
            )
            queued_result = await db.execute(queued_call_query)
            queued_call = queued_result.scalar_one_or_none()
            
            if queued_call:
                print(f"   ⏳ Organization {org_name} already has a queued call - skipping")
                return
            
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
            
            # Take the first ready service record and queue its call
            first_service_record = ready_service_records[0]
            await self._queue_service_record_call(first_service_record, org_name, db)
                
        except Exception as e:
            logger.error(f"❌ Error processing organization {org_name}: {str(e)}")
    
    async def _queue_service_record_call(self, service_record: ServiceRecord, org_name: str, db: AsyncSession):
        """Queue a call for a service record by changing its status to 'Queued'."""
        print(f"   📞 Queuing call for service record {service_record.id} - {service_record.customer_name}")
        
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
            
            # Update call status to "Queued"
            call.status = "Queued"
            
            # Commit the status change
            await db.commit()
            
            print(f"      ✅ Queued call {call.id} for service record {service_record.id}")
            
        except Exception as e:
            logger.error(f"❌ Error queuing call for service record {service_record.id}: {str(e)}")
            await db.rollback()
    
    async def _process_queued_calls(self, db: AsyncSession):
        """Process queued calls by changing their status to 'In Progress' and triggering VAPI calls."""
        print("🔄 Processing queued calls...")
        
        try:
            # Get current "In Progress" calls count
            in_progress_count = await self._get_in_progress_calls_count(db)
            available_slots = 5 - in_progress_count
            
            if available_slots <= 0:
                print("⚠️  No available slots for processing queued calls")
                return
            
            # Find queued calls
            queued_calls_query = select(Call).join(Call.service_record).join(Call.organization).where(
                Call.status == "Queued"
            ).options(joinedload(Call.service_record), joinedload(Call.organization))
            
            queued_calls_result = await db.execute(queued_calls_query)
            queued_calls = queued_calls_result.unique().scalars().all()
            
            if not queued_calls:
                print("   ⏭️  No queued calls found")
                return
            
            print(f"   📋 Found {len(queued_calls)} queued calls")
            
            # Process up to available_slots queued calls
            calls_to_process = queued_calls[:available_slots]
            
            for call in calls_to_process:
                await self._process_queued_call(call, db)
                
                # Add 3-minute delay between calls (except for the last one)
                if call != calls_to_process[-1]:
                    print(f"   ⏳ Waiting 3 minutes before next call...")
                    await asyncio.sleep(180)  # 3 minutes = 180 seconds
                
        except Exception as e:
            logger.error(f"❌ Error processing queued calls: {str(e)}")
    
    async def _process_queued_call(self, call: Call, db: AsyncSession):
        """Process a single queued call by changing status to 'In Progress' and triggering VAPI call."""
        print(f"   📞 Processing queued call {call.id} for {call.service_record.customer_name}")
        
        try:
            # Update service record status to "In Progress"
            call.service_record.status = "In Progress"
            
            # Update call status to "In Progress"
            call.status = "In Progress"
            
            # Commit the status changes
            await db.commit()
            
            print(f"      ✅ Updated status to 'In Progress' for service record {call.service_record.id} and call {call.id}")
            
            # Trigger VAPI call
            await self._trigger_vapi_call(call, call.service_record, call.organization)
            
        except Exception as e:
            logger.error(f"❌ Error processing queued call {call.id}: {str(e)}")
            await db.rollback()
    
    async def _trigger_vapi_call(self, call: Call, service_record: ServiceRecord, organization: Organization):
        """Trigger VAPI call for the given call and service record."""
        try:
            print(f"      📞 Triggering VAPI call for {service_record.customer_name}")
            
            # Get location from organization - prefer location_city, fallback to location, then default
            location = organization.location_city or organization.location or "Main Location"
            
            # Initialize VAPI service
            vapi_service = VAPIService()
            
            # Make the VAPI call
            vapi_response = await vapi_service.create_call(
                phone=service_record.customer_phone,
                customer_name=service_record.customer_name,
                service_advisor_name=service_record.service_advisor_name or "Service Advisor",
                service_type=service_record.service_type or "Service Call",
                organization_name=organization.name,
                location=location,
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
                # Check current "In Progress" calls count
                in_progress_count = await self._get_in_progress_calls_count(db)
                print(f"📊 Current 'In Progress' calls: {in_progress_count}")
                
                stats = {
                    "total_organizations": 0,
                    "organizations_processed": 0,
                    "calls_processed": 0,
                    "calls_initiated": 0,
                    "calls_skipped": 0,
                    "calls_queued": 0
                }
                
                if in_progress_count > 5:
                    print("⚠️  Too many concurrent calls (>5). Holding service and waiting for next run.")
                    return stats
                
                # If In Progress calls <= 5, proceed with processing
                if in_progress_count <= 5:
                    # First, queue calls for organizations
                    queue_stats = await self._queue_calls_for_organizations_with_stats(db)
                    stats.update(queue_stats)
                    
                    # Then process queued calls by making them In Progress and initiating VAPI calls
                    queued_stats = await self._process_queued_calls_with_stats(db)
                    stats.update(queued_stats)
                
                print(f"📊 Single cycle completed: {stats}")
                return stats
                
        except Exception as e:
            logger.error(f"💥 Error in single cycle: {str(e)}")
            return {"error": str(e)}
    
    async def _queue_calls_for_organizations_with_stats(self, db: AsyncSession) -> dict:
        """Queue calls for all organizations and return statistics."""
        stats = {
            "total_organizations": 0,
            "organizations_processed": 0,
            "calls_processed": 0,
            "calls_initiated": 0,
            "calls_skipped": 0,
            "calls_queued": 0
        }
        
        try:
            # Get all organizations
            result = await db.execute(select(Organization.name, Organization.id))
            organizations = result.fetchall()
            stats["total_organizations"] = len(organizations)
            
            if organizations:
                for org_name, org_id in organizations:
                    # Check if organization is in active time window
                    if await self._is_organization_in_time_window(org_id, org_name, db):
                        # Queue call for this organization
                        org_stats = await self._queue_call_for_organization_with_stats(org_id, org_name, db)
                        stats["organizations_processed"] += 1
                        stats["calls_queued"] += org_stats.get("calls_queued", 0)
                    else:
                        stats["calls_skipped"] += 1
                        
        except Exception as e:
            logger.error(f"❌ Error queuing calls for organizations: {str(e)}")
        
        return stats
    
    async def _queue_call_for_organization_with_stats(self, org_id, org_name: str, db: AsyncSession) -> dict:
        """Queue a call for a specific organization and return statistics."""
        stats = {
            "calls_queued": 0
        }
        
        try:
            # Check if we already have a "Queued" call for this organization
            queued_call_query = select(Call).join(Call.service_record).where(
                and_(
                    ServiceRecord.organization_id == org_id,
                    Call.status == "Queued"
                )
            )
            queued_result = await db.execute(queued_call_query)
            queued_call = queued_result.scalar_one_or_none()
            
            if queued_call:
                return stats
            
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
            
            # Take the first ready service record and queue its call
            first_service_record = ready_service_records[0]
            call_queued = await self._queue_service_record_call_with_stats(first_service_record, org_name, db)
            if call_queued:
                stats["calls_queued"] += 1
                
        except Exception as e:
            logger.error(f"❌ Error queuing call for organization {org_name}: {str(e)}")
        
        return stats
    
    async def _process_organization_with_stats(self, org_id, org_name: str, db: AsyncSession) -> dict:
        """Process organization and return statistics."""
        stats = {
            "calls_processed": 0,
            "calls_initiated": 0,
            "calls_skipped": 0,
            "calls_queued": 0
        }
        
        try:
            # Check if we already have a "Queued" call for this organization
            queued_call_query = select(Call).join(Call.service_record).where(
                and_(
                    ServiceRecord.organization_id == org_id,
                    Call.status == "Queued"
                )
            )
            queued_result = await db.execute(queued_call_query)
            queued_call = queued_result.scalar_one_or_none()
            
            if queued_call:
                return stats
            
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
            
            # Take the first ready service record and queue its call
            first_service_record = ready_service_records[0]
            call_queued = await self._queue_service_record_call_with_stats(first_service_record, org_name, db)
            if call_queued:
                stats["calls_queued"] += 1
                
        except Exception as e:
            logger.error(f"❌ Error processing organization {org_name}: {str(e)}")
        
        return stats
    
    async def _queue_service_record_call_with_stats(self, service_record: ServiceRecord, org_name: str, db: AsyncSession) -> bool:
        """Queue a call for a service record and return whether it was queued successfully."""
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
            
            # Update call status to "Queued"
            call.status = "Queued"
            
            # Commit the status change
            await db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error queuing call for service record {service_record.id}: {str(e)}")
            await db.rollback()
            return False
    
    async def _process_queued_calls_with_stats(self, db: AsyncSession) -> dict:
        """Process queued calls and return statistics."""
        stats = {
            "calls_processed": 0,
            "calls_initiated": 0,
            "calls_skipped": 0,
            "calls_queued": 0
        }
        
        try:
            # Get current "In Progress" calls count
            in_progress_count = await self._get_in_progress_calls_count(db)
            available_slots = 5 - in_progress_count
            
            if available_slots <= 0:
                return stats
            
            # Find queued calls
            queued_calls_query = select(Call).join(Call.service_record).join(Call.organization).where(
                Call.status == "Queued"
            ).options(joinedload(Call.service_record), joinedload(Call.organization))
            
            queued_calls_result = await db.execute(queued_calls_query)
            queued_calls = queued_calls_result.unique().scalars().all()
            
            if not queued_calls:
                return stats
            
            # Process up to available_slots queued calls
            calls_to_process = queued_calls[:available_slots]
            
            for call in calls_to_process:
                call_processed = await self._process_queued_call_with_stats(call, db)
                if call_processed:
                    stats["calls_processed"] += 1
                    stats["calls_initiated"] += 1
                
                # Add 3-minute delay between calls (except for the last one)
                if call != calls_to_process[-1]:
                    await asyncio.sleep(180)  # 3 minutes = 180 seconds
                
        except Exception as e:
            logger.error(f"❌ Error processing queued calls: {str(e)}")
        
        return stats
    
    async def _process_queued_call_with_stats(self, call: Call, db: AsyncSession) -> bool:
        """Process a single queued call and return whether it was processed successfully."""
        try:
            # Update service record status to "In Progress"
            call.service_record.status = "In Progress"
            
            # Update call status to "In Progress"
            call.status = "In Progress"
            
            # Commit the status changes
            await db.commit()
            
            # Trigger VAPI call
            await self._trigger_vapi_call(call, call.service_record, call.organization)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error processing queued call {call.id}: {str(e)}")
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