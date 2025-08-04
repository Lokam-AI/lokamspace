"""
Main API router for v1 endpoints.
"""

from fastapi import APIRouter

# Import all endpoint routers here
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.calls import router as calls_router
from app.api.v1.endpoints.campaigns import router as campaigns_router
from app.api.v1.endpoints.dms_integration import router as dms_integration_router
from app.api.v1.endpoints.knowledge_files import router as knowledge_files_router
from app.api.v1.endpoints.metrics import router as metrics_router
from app.api.v1.endpoints.organizations import router as organizations_router
from app.api.v1.endpoints.schedule_config import router as schedule_config_router
from app.api.v1.endpoints.service_records import router as service_records_router
from app.api.v1.endpoints.settings import router as settings_router
from app.api.v1.endpoints.tags import router as tags_router
from app.api.v1.endpoints.transcripts import router as transcripts_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.webhooks import router as webhook_router

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations_router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(campaigns_router, prefix="/campaigns", tags=["Campaigns"])
api_router.include_router(service_records_router, prefix="/service-records", tags=["Service Records"])
# Use a separate prefix for schedule_config to avoid conflicts
api_router.include_router(schedule_config_router, prefix="/schedule-config", tags=["Calls", "Schedule Configuration"])
api_router.include_router(calls_router, prefix="/calls", tags=["Calls"])
api_router.include_router(transcripts_router, prefix="/transcripts", tags=["Transcripts"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(metrics_router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(tags_router, prefix="/tags", tags=["Tags"])
api_router.include_router(knowledge_files_router, prefix="/knowledge-files", tags=["Knowledge Files"])
api_router.include_router(dms_integration_router, prefix="/dms-integration", tags=["DMS Integration"])
api_router.include_router(webhook_router, prefix="/webhooks", tags=["Webhooks"]) 