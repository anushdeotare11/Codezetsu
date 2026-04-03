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


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Get top users by XP."""
    try:
        result = await db.execute(
            select(ProfileModel)
            .order_by(ProfileModel.xp.desc())
            .limit(limit)
        )
        profiles = result.scalars().all()
        
        if profiles:
            return [
                {
                    "rank": i + 1,
                    "username": p.username,
                    "display_name": p.display_name,
                    "level": p.level,
                    "xp": p.xp,
                    "total_solved": p.total_solved,
                }
                for i, p in enumerate(profiles)
            ]
    except Exception:
        pass
    
    # Return mock leaderboard
    return [
        {"rank": 1, "username": "code_ninja", "display_name": "Code Ninja", "level": 15, "xp": 5420, "total_solved": 87},
        {"rank": 2, "username": "algo_master", "display_name": "Algorithm Master", "level": 14, "xp": 4850, "total_solved": 72},
        {"rank": 3, "username": "dev_warrior", "display_name": "Dev Warrior", "level": 12, "xp": 3920, "total_solved": 58},
        {"rank": 4, "username": "byte_crusher", "display_name": "Byte Crusher", "level": 11, "xp": 3450, "total_solved": 51},
        {"rank": 5, "username": "syntax_sage", "display_name": "Syntax Sage", "level": 10, "xp": 2980, "total_solved": 45},
    ]


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
