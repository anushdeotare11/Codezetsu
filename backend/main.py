"""
main.py - FastAPI application entry point for SkillSprint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.submissions import router as submissions_router

app = FastAPI(
    title="SkillSprint API",
    description="AI-powered adaptive coding challenge platform",
    version="1.0.0",
)

# CORS — allow all origins for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(submissions_router, prefix="/api")


@app.get("/")
def root():
    """Health-check / landing endpoint."""
    return {"message": "SkillSprint Backend Running 🚀"}
