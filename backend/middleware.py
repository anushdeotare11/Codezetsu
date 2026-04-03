"""Rate limiting middleware for SkillSprint API."""

import time
from collections import defaultdict
from typing import Callable, Dict, Tuple
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimiter:
    """Simple in-memory rate limiter using sliding window."""
    
    def __init__(self):
        # {client_id: [(timestamp, count), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        # Default limits
        self.limits = {
            "default": (100, 60),  # 100 requests per 60 seconds
            "submit": (10, 60),    # 10 submissions per 60 seconds
            "ai": (20, 60),        # 20 AI calls per 60 seconds
        }
    
    def _clean_old_requests(self, client_id: str, window: int):
        """Remove requests outside the time window."""
        now = time.time()
        self.requests[client_id] = [
            ts for ts in self.requests[client_id]
            if now - ts < window
        ]
    
    def is_allowed(self, client_id: str, limit_type: str = "default") -> Tuple[bool, int]:
        """
        Check if request is allowed.
        Returns (allowed, remaining_requests).
        """
        max_requests, window = self.limits.get(limit_type, self.limits["default"])
        
        self._clean_old_requests(client_id, window)
        
        current_count = len(self.requests[client_id])
        remaining = max(0, max_requests - current_count)
        
        if current_count >= max_requests:
            return False, 0
        
        self.requests[client_id].append(time.time())
        return True, remaining - 1
    
    def get_retry_after(self, client_id: str, limit_type: str = "default") -> int:
        """Get seconds until next request is allowed."""
        _, window = self.limits.get(limit_type, self.limits["default"])
        
        if not self.requests[client_id]:
            return 0
        
        oldest = min(self.requests[client_id])
        return max(0, int(window - (time.time() - oldest)))


# Global rate limiter instance
rate_limiter = RateLimiter()


def get_client_id(request: Request) -> str:
    """Get client identifier from request."""
    # Use forwarded IP if behind proxy, otherwise use client host
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_limit_type(path: str) -> str:
    """Determine rate limit type based on path."""
    if "/submit" in path or "/submissions" in path and "POST" in path:
        return "submit"
    if "/challenge" in path or "/hint" in path or "/explain" in path:
        return "ai"
    return "default"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce rate limits."""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        client_id = get_client_id(request)
        limit_type = get_limit_type(request.url.path)
        
        allowed, remaining = rate_limiter.is_allowed(client_id, limit_type)
        
        if not allowed:
            retry_after = rate_limiter.get_retry_after(client_id, limit_type)
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "retry_after": retry_after
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Remaining": "0"
                }
            )
        
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response


# Simple cache for API responses
class SimpleCache:
    """Simple in-memory cache with TTL."""
    
    def __init__(self, default_ttl: int = 60):
        self.cache: Dict[str, Tuple[any, float]] = {}
        self.default_ttl = default_ttl
    
    def get(self, key: str):
        """Get value from cache if not expired."""
        if key in self.cache:
            value, expires = self.cache[key]
            if time.time() < expires:
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: any, ttl: int = None):
        """Set value in cache with TTL."""
        ttl = ttl or self.default_ttl
        self.cache[key] = (value, time.time() + ttl)
    
    def invalidate(self, key: str):
        """Remove key from cache."""
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        """Clear all cache entries."""
        self.cache.clear()


# Global cache instance
api_cache = SimpleCache(default_ttl=300)  # 5 minute default TTL
