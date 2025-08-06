"""
In-memory rate limiting for API endpoints.
"""

import time
from typing import Dict, List
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request
from functools import wraps
from app.core.config import settings


class InMemoryRateLimiter:
    """In-memory rate limiter using sliding window approach."""
    
    def __init__(self):
        # Dictionary to store request timestamps per API key
        # Format: {api_key_id: [timestamp1, timestamp2, ...]}
        self.requests: Dict[str, List[float]] = {}
    
    def is_allowed(self, identifier: str, limit: int, window_seconds: int = 60) -> bool:
        """
        Check if request is allowed within the rate limit.
        
        Args:
            identifier: Unique identifier (API key ID or IP)
            limit: Maximum number of requests allowed
            window_seconds: Time window in seconds (default: 60 for per-minute)
            
        Returns:
            bool: True if request is allowed, False otherwise
        """
        current_time = time.time()
        
        # Initialize if not exists
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Remove old requests outside the window
        cutoff_time = current_time - window_seconds
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier] 
            if req_time > cutoff_time
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) < limit:
            # Add current request
            self.requests[identifier].append(current_time)
            return True
        
        return False
    
    def get_reset_time(self, identifier: str, window_seconds: int = 60) -> int:
        """Get time until rate limit resets."""
        if identifier not in self.requests or not self.requests[identifier]:
            return 0
        
        oldest_request = min(self.requests[identifier])
        reset_time = oldest_request + window_seconds
        return max(0, int(reset_time - time.time()))


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


def get_rate_limit_identifier(request: Request) -> str:
    """Get identifier for rate limiting."""
    # Use API key ID if available
    if hasattr(request.state, 'api_key'):
        return f"api_key:{request.state.api_key.id}"
    
    # Fallback to IP address
    client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}"


def rate_limit_dependency(request: Request):
    """
    FastAPI dependency for rate limiting.
    
    Args:
        request: FastAPI request object
        
    Raises:
        HTTPException: If rate limit is exceeded
    """
    identifier = get_rate_limit_identifier(request)
    
    # Get rate limit from API key or use default
    if hasattr(request.state, 'api_key'):
        limit = request.state.api_key.rate_limit_per_minute
    else:
        limit = getattr(settings, 'DEFAULT_RATE_LIMIT_PER_MINUTE', 10)
    
    if not rate_limiter.is_allowed(identifier, limit, 60):  # 60 seconds = 1 minute
        reset_time = rate_limiter.get_reset_time(identifier, 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {reset_time} seconds.",
            headers={
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + reset_time),
                "Retry-After": str(reset_time)
            }
        )


def cleanup_old_requests():
    """Cleanup old request records to prevent memory leaks."""
    current_time = time.time()
    cutoff_time = current_time - 3600  # Keep last hour
    
    for identifier in list(rate_limiter.requests.keys()):
        rate_limiter.requests[identifier] = [
            req_time for req_time in rate_limiter.requests[identifier]
            if req_time > cutoff_time
        ]
        
        # Remove empty entries
        if not rate_limiter.requests[identifier]:
            del rate_limiter.requests[identifier]