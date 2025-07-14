"""
Middleware for request processing.
"""

import logging
from typing import Optional

from fastapi import Request
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.database import get_db

logger = logging.getLogger(__name__)


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware for handling multi-tenant context.
    Extracts organization_id from JWT token and stores it in request state.
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        Process each request to extract tenant information.
        
        Args:
            request: The incoming request
            call_next: The next middleware/endpoint handler
            
        Returns:
            The response from the next handler
        """
        # Skip tenant extraction for auth endpoints and health check
        if request.url.path in [f"{settings.API_V1_STR}/auth/login", "/health"]:
            return await call_next(request)
            
        try:
            # Extract token from Authorization header
            organization_id = self._extract_tenant_from_token(request)
            
            # Store organization_id in request state
            if organization_id:
                request.state.organization_id = organization_id
                
                # Set up tenant context for database operations
                await self._setup_tenant_context(request, organization_id)
                
        except Exception as e:
            logger.warning(f"Error in tenant middleware: {e}")
        
        # Continue with the request
        response = await call_next(request)
        
        # Clean up tenant context if needed
        if hasattr(request.state, "organization_id"):
            await self._cleanup_tenant_context(request)
        
        return response
    
    def _extract_tenant_from_token(self, request: Request) -> Optional[str]:
        """
        Extract tenant ID from JWT token.
        
        Args:
            request: The incoming request
            
        Returns:
            Optional[str]: The organization ID or None if not found/invalid
        """
        # Get Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
            
        # Extract token
        token = auth_header.split("Bearer ")[1]
        
        try:
            # Decode token
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Extract organization_id
            return payload.get("organization_id")
            
        except JWTError:
            return None
    
    async def _setup_tenant_context(self, request: Request, organization_id: str):
        """
        Set up tenant context for database operations.
        
        Args:
            request: The incoming request
            organization_id: The organization ID
        """
        # Store organization_id in request state for use in dependencies
        request.state.tenant_id = organization_id
        
        # Add tenant filter function to request state
        request.state.tenant_filter = lambda query, model: (
            query.filter(model.organization_id == organization_id)
            if hasattr(model, "organization_id")
            else query
        )
    
    async def _cleanup_tenant_context(self, request: Request):
        """
        Clean up tenant context after request processing.
        
        Args:
            request: The incoming request
        """
        # Nothing to clean up for now, but can be extended if needed
        pass


class TenantQueryFilter:
    """
    Helper class for filtering queries by tenant.
    """
    
    @staticmethod
    def add_tenant_filter(query, model, organization_id):
        """
        Add tenant filter to query if model has organization_id.
        
        Args:
            query: SQLAlchemy query
            model: SQLAlchemy model
            organization_id: Organization ID
            
        Returns:
            SQLAlchemy query with tenant filter
        """
        if hasattr(model, "organization_id"):
            return query.filter(model.organization_id == organization_id)
        return query 