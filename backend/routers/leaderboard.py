"""Leaderboard API router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from services.gamification import get_leaderboard as fetch_leaderboard

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("")
async def get_leaderboard(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """
    Get top users ranked by XP.
    
    Returns rank, username, display_name, avatar_url, xp, level, 
    current_streak, and problems_solved.
    """
    try:
        leaderboard = await fetch_leaderboard(db, limit)
        return leaderboard
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return []
