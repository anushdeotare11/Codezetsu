"""
SkillSprint Backend - FastAPI Application

A gamified coding challenge platform with real-time code execution.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import init_db, settings
from routers import problems_router, submissions_router, users_router, challenges_router, skills_router, leaderboard_router
from middleware import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("🚀 Starting SkillSprint Backend...")
    print(f"📦 Environment: {settings.environment}")
    
    # Initialize database tables
    try:
        await init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database initialization skipped: {e}")
        print("   (Using in-memory/mock data)")
    
    yield
    
    # Shutdown
    print("👋 Shutting down SkillSprint Backend...")


app = FastAPI(
    title="SkillSprint API",
    description="Backend API for the SkillSprint gamified coding platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware - allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # Next.js dev
        "http://localhost:5173",     # Vite dev
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Include API routers
app.include_router(problems_router)
app.include_router(submissions_router)
app.include_router(users_router)
app.include_router(challenges_router)
app.include_router(skills_router)
app.include_router(leaderboard_router)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "online",
        "name": "SkillSprint API",
        "version": "1.0.0",
        "environment": settings.environment,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "endpoints": {
            "problems": {
                "list": "GET /api/problems",
                "get": "GET /api/problems/{id}",
                "hint": "POST /api/problems/{id}/hint",
                "explain": "POST /api/problems/{id}/explain",
                "topics": "GET /api/problems/topics/list"
            },
            "submissions": {
                "submit": "POST /api/submissions",
                "history": "GET /api/submissions/history",
                "get": "GET /api/submissions/{id}"
            },
            "challenges": {
                "next": "POST /api/challenge/next",
                "random": "GET /api/challenge/random",
                "weaknesses": "GET /api/challenge/weaknesses"
            },
            "skills": {
                "radar": "GET /api/skills/radar",
                "summary": "GET /api/skills/summary",
                "dimensions": "GET /api/skills/dimensions"
            },
            "users": {
                "me": "GET /api/users/me",
                "stats": "GET /api/users/stats"
            },
            "leaderboard": {
                "top": "GET /api/leaderboard"
            }
        },
        "documentation": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development"
    )
