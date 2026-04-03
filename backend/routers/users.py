"""Users API router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from models.schemas import (
    ProfileModel,
    SubmissionModel,
    UserStats,
    ProfileResponse,
    SubmissionStatus,
)

router = APIRouter(prefix="/api/users", tags=["users"])


# Mock user for development (no auth yet)
MOCK_USER = {
    "id": "dev-user-001",
    "username": "dev_warrior",
    "display_name": "Dev Warrior",
    "avatar_url": None,
    "level": 5,
    "xp": 1250,
    "total_solved": 12,
    "current_streak": 3,
    "longest_streak": 7,
}


@router.get("/me", response_model=ProfileResponse)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Get current user profile."""
    try:
        result = await db.execute(
            select(ProfileModel).where(ProfileModel.id == MOCK_USER["id"])
        )
        profile = result.scalar_one_or_none()
        
        if profile:
            return profile
    except Exception:
        pass
    
    # Return mock user if not in DB
    return ProfileResponse(**MOCK_USER)


@router.get("/stats", response_model=UserStats)
async def get_user_stats(db: AsyncSession = Depends(get_db)):
    """Get statistics for the current user."""
    user_id = MOCK_USER["id"]
    
    try:
        # Total submissions
        total_result = await db.execute(
            select(func.count(SubmissionModel.id)).where(
                SubmissionModel.user_id == user_id
            )
        )
        total_submissions = total_result.scalar() or 0
        
        # Problems solved (accepted submissions, distinct problems)
        solved_result = await db.execute(
            select(func.count(func.distinct(SubmissionModel.problem_id))).where(
                SubmissionModel.user_id == user_id,
                SubmissionModel.status == SubmissionStatus.ACCEPTED.value
            )
        )
        problems_solved = solved_result.scalar() or 0
        
        # Get user profile for streak info
        profile_result = await db.execute(
            select(ProfileModel).where(ProfileModel.id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        return UserStats(
            total_submissions=total_submissions,
            problems_solved=problems_solved,
            current_streak=profile.current_streak if profile else MOCK_USER["current_streak"],
            level=profile.level if profile else MOCK_USER["level"],
            xp=profile.xp if profile else MOCK_USER["xp"],
        )
    except Exception as e:
        # Return mock stats if DB fails
        print(f"Warning: Could not fetch stats from DB: {e}")
        return UserStats(
            total_submissions=15,
            problems_solved=MOCK_USER["total_solved"],
            easy_solved=8,
            medium_solved=3,
            hard_solved=1,
            current_streak=MOCK_USER["current_streak"],
            level=MOCK_USER["level"],
            xp=MOCK_USER["xp"],
        )


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_user_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get a user's public profile."""
    try:
        result = await db.execute(
            select(ProfileModel).where(ProfileModel.id == user_id)
        )
        profile = result.scalar_one_or_none()
        
        if profile:
            return profile
    except Exception:
        pass
    
    # Check if it's the mock user
    if user_id == MOCK_USER["id"]:
        return ProfileResponse(**MOCK_USER)
    
    raise HTTPException(status_code=404, detail="User not found")
