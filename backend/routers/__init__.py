"""API Routers package."""

from .problems import router as problems_router
from .submissions import router as submissions_router
from .users import router as users_router
from .challenges import router as challenges_router
from .skills import router as skills_router

__all__ = [
    "problems_router", 
    "submissions_router", 
    "users_router",
    "challenges_router",
    "skills_router"
]
