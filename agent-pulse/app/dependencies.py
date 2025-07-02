from fastapi import Depends, HTTPException, Header
from app.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

async def verify_security_token(x_security_token: str = Header(None)) -> str:
    """Verify the security token for protected endpoints."""
    if not x_security_token or x_security_token != settings.SECURITY_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing security token")
    return x_security_token

async def verify_vapi_secret(x_vapi_secret: str = Header(None)) -> str:
    """Verify the VAPI secret token for webhook endpoints."""
    logger.info(f"Verifying VAPI secret. Received: {x_vapi_secret is not None}")
    
    if not x_vapi_secret:
        logger.error("Missing VAPI secret token")
        raise HTTPException(status_code=401, detail="Missing secret token")
    
    if x_vapi_secret != settings.ASSISTANT_SECRET_TOKEN:
        logger.error("Invalid VAPI secret token")
        raise HTTPException(status_code=401, detail="Invalid secret token")
    
    logger.info("VAPI secret token verified successfully")
    return x_vapi_secret 