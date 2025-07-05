"""
Main API router for v1 endpoints.
"""

from fastapi import APIRouter

# Import all endpoint routers here
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.calls import router as calls_router
from app.api.v1.endpoints.campaigns import router as campaigns_router
from app.api.v1.endpoints.knowledge_files import router as knowledge_files_router
from app.api.v1.endpoints.organizations import router as organizations_router
from app.api.v1.endpoints.service_records import router as service_records_router
from app.api.v1.endpoints.settings import router as settings_router
from app.api.v1.endpoints.transcripts import router as transcripts_router
from app.api.v1.endpoints.users import router as users_router

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations_router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(campaigns_router, prefix="/campaigns", tags=["Campaigns"])
api_router.include_router(service_records_router, prefix="/service-records", tags=["Service Records"])
api_router.include_router(calls_router, prefix="/calls", tags=["Calls"])
api_router.include_router(transcripts_router, prefix="/transcripts", tags=["Transcripts"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(knowledge_files_router, prefix="/knowledge-files", tags=["Knowledge Files"]) 