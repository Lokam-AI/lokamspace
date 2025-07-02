from fastapi import APIRouter

from app.api.v1.endpoints import calls, webhooks

router = APIRouter()

# Include all endpoint routers
router.include_router(calls.router, prefix="/calls", tags=["calls"])
router.include_router(webhooks.router, tags=["webhooks"]) 