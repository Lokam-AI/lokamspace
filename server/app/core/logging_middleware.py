"""
Comprehensive logging middleware for FastAPI applications.
Captures request details, response information, and performance metrics.
"""

import json
import logging
import time
from typing import Any, Dict, Optional
from urllib.parse import parse_qs

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.logging_config import LoggingConfig

# Configure structured logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("api_logger")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Comprehensive logging middleware that captures:
    - Request details (URL, method, headers, query params, path params, body)
    - Response details (status code, response time, size)
    - Performance metrics
    - Error tracking
    """
    
    def __init__(
        self,
        app: ASGIApp,
        log_request_body: bool = None,
        exclude_paths: Optional[list] = None,
    ):
        super().__init__(app)
        self.log_request_body = log_request_body if log_request_body is not None else LoggingConfig.LOG_REQUEST_BODY
        self.exclude_paths = exclude_paths or LoggingConfig.EXCLUDE_PATHS
    
    async def dispatch(self, request: Request, call_next):
        """
        Process request and log comprehensive details.
        
        Args:
            request: The incoming request
            call_next: The next middleware/endpoint handler
            
        Returns:
            The response from the next handler
        """
        # Skip logging for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Generate unique request ID
        request_id = self._generate_request_id()
        
        # Start timing
        start_time = time.time()
        
        # Log request details
        await self._log_request(request, request_id)
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Log response details
            await self._log_response(response, request_id, response_time, request)
            
            return response
            
        except Exception as e:
            # Log error details
            response_time = time.time() - start_time
            await self._log_error(e, request_id, response_time)
            raise
    
    async def _log_request(self, request: Request, request_id: str):
        """Log focused request details."""
        try:
            # Parse query parameters
            query_params = dict(request.query_params)
            
            # Parse path parameters (if available)
            path_params = dict(request.path_params) if hasattr(request, 'path_params') else {}
            
            # Get request body (if applicable)
            request_body = None
            if self.log_request_body and request.method in ["POST", "PUT", "PATCH"]:
                request_body = await self._get_request_body(request)
            
            # Get organization ID from request state
            organization_id = getattr(request.state, 'organization_id', None)
            
            # Create focused log entry
            log_data = {
                "timestamp": time.time(),
                "level": "INFO",
                "type": "request",
                "endpoint": request.url.path,
                "method": request.method,
                "query_params": query_params,
                "path_params": path_params,
                "organization_id": organization_id,
            }
            
            # Add request ID if enabled
            if LoggingConfig.INCLUDE_REQUEST_ID:
                log_data["request_id"] = request_id
            
            if request_body:
                log_data["body"] = request_body
            
            # Log as JSON for easy parsing
            logger.info(f"REQUEST: {json.dumps(log_data, default=str)}")
            
        except Exception as e:
            logger.error(f"Error logging request: {e}")
    
    async def _log_response(self, response: Response, request_id: str, response_time: float, request: Request):
        """Log focused response details."""
        try:
            # Get organization ID from request state
            organization_id = getattr(request.state, 'organization_id', None)
            
            # Create focused log entry
            log_data = {
                "timestamp": time.time(),
                "level": "INFO",
                "type": "response",
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "organization_id": organization_id,
            }
            
            # Add request ID if enabled
            if LoggingConfig.INCLUDE_REQUEST_ID:
                log_data["request_id"] = request_id
            
            # Determine log level based on status code
            log_level = LoggingConfig.ERROR_LOG_LEVEL if response.status_code >= 400 else LoggingConfig.SUCCESS_LOG_LEVEL
            log_data["level"] = log_level
            
            # Log as JSON
            log_message = f"RESPONSE: {json.dumps(log_data, default=str)}"
            if log_level == "ERROR":
                logger.error(log_message)
            else:
                logger.info(log_message)
                
        except Exception as e:
            logger.error(f"Error logging response: {e}")
    
    async def _log_error(self, error: Exception, request_id: str, response_time: float):
        """Log error details."""
        try:
            log_data = {
                "timestamp": time.time(),
                "level": "ERROR",
                "type": "error",
                "error_type": type(error).__name__,
                "error_message": str(error),
            }
            
            # Add request ID if enabled
            if LoggingConfig.INCLUDE_REQUEST_ID:
                log_data["request_id"] = request_id
            
            # Add performance metrics if enabled
            if LoggingConfig.LOG_PERFORMANCE:
                log_data["response_time_ms"] = round(response_time * 1000, 2)
            
            logger.error(f"ERROR: {json.dumps(log_data, default=str)}")
            
        except Exception as e:
            logger.error(f"Error logging error: {e}")
    
    async def _get_request_body(self, request: Request) -> Optional[Dict[str, Any]]:
        """Safely extract and filter request body."""
        try:
            # Check content type
            content_type = request.headers.get("content-type", "")
            
            if "application/json" in content_type:
                body = await request.json()
                return self._filter_sensitive_fields(body)
            elif "application/x-www-form-urlencoded" in content_type:
                body = await request.form()
                return dict(body)
            elif "multipart/form-data" in content_type:
                body = await request.form()
                return dict(body)
            else:
                # For other content types, try to get raw body
                body = await request.body()
                return {"raw_body": body.decode("utf-8", errors="ignore")[:LoggingConfig.MAX_BODY_SIZE]}
                
        except Exception as e:
            logger.warning(f"Could not parse request body: {e}")
            return None
    
    def _filter_sensitive_fields(self, data: Any) -> Any:
        """Recursively filter sensitive fields from data structures."""
        if isinstance(data, dict):
            filtered = {}
            for key, value in data.items():
                if key.lower() in ["password", "token", "secret", "api_key"]:
                    filtered[key] = "[REDACTED]"
                else:
                    filtered[key] = self._filter_sensitive_fields(value)
            return filtered
        elif isinstance(data, list):
            return [self._filter_sensitive_fields(item) for item in data]
        else:
            return data
    
    def _generate_request_id(self) -> str:
        """Generate unique request ID."""
        import uuid
        return str(uuid.uuid4())


# Convenience function for easy setup
def setup_request_logging(
    app,
    log_request_body: bool = True,
    exclude_paths: Optional[list] = None,
):
    """
    Convenience function to add request logging middleware to FastAPI app.
    
    Args:
        app: FastAPI application instance
        log_request_body: Whether to log request bodies
        exclude_paths: List of paths to exclude from logging
    """
    app.add_middleware(
        RequestLoggingMiddleware,
        log_request_body=log_request_body,
        exclude_paths=exclude_paths,
    )
    
    return app 