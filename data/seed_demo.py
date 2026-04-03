"""
Seed Demo Data for SkillSprint Leaderboard and Gamification.
Creates realistic placeholder profiles if they don't exist.
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from config import get_settings
from models.schemas import ProfileModel, UserAchievementModel, UserSkillModel

DEMO_USERS = [
    {
        "id": "dev-user-001",
        "username": "dev_warrior",
        "display_name": "Dev Warrior",
        "level": 5,
        "xp": 1250,
        "total_solved": 12,
        "current_streak": 3,
        "longest_streak": 7,
    },
    {
        "id": "demo-ninja",
        "username": "code_ninja",
        "display_name": "Code Ninja",
        "level": 15,
        "xp": 5420,
        "total_solved": 87,
        "current_streak": 14,
        "longest_streak": 21,
    },
    {
        "id": "demo-master",
        "username": "algo_master",
        "display_name": "Algorithm Master",
        "level": 14,
        "xp": 4850,
        "total_solved": 72,
        "current_streak": 8,
        "longest_streak": 12,
    },
    {
        "id": "demo-dev",
        "username": "dev_warrior",
        "display_name": "Dev Warrior",
        "level": 12,
        "xp": 3920,
        "total_solved": 58,
        "current_streak": 3,
        "longest_streak": 9,
    },
    {
        "id": "demo-crusher",
        "username": "byte_crusher",
        "display_name": "Byte Crusher",
        "level": 11,
        "xp": 3450,
        "total_solved": 51,
        "current_streak": 1,
        "longest_streak": 5,
    },
    {
        "id": "demo-sage",
        "username": "syntax_sage",
        "display_name": "Syntax Sage",
        "level": 10,
        "xp": 2980,
        "total_solved": 45,
        "current_streak": 5,
        "longest_streak": 14,
    }
]

async def seed_demo():
    settings = get_settings()
    engine = create_async_engine(
        settings.async_database_url,
        echo=False,
        pool_pre_ping=True,
        connect_args={"ssl": True},
    )
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with SessionLocal() as session:
        for u in DEMO_USERS:
            # Check if exists
            result = await session.execute(select(ProfileModel).where(ProfileModel.id == u["id"]))
            existing = result.scalar_one_or_none()
            
            if not existing:
                print(f"Creating demo user: {u['username']}")
                profile = ProfileModel(**u)
                session.add(profile)
                
                # Add some stub achievements
                ach1 = UserAchievementModel(user_id=u["id"], achievement_key="first_solve")
                ach2 = UserAchievementModel(user_id=u["id"], achievement_key="streak_3")
                if u["level"] > 12:
                    ach3 = UserAchievementModel(user_id=u["id"], achievement_key="boss_slayer")
                    session.add(ach3)
                session.add_all([ach1, ach2])
                
        await session.commit()
    await engine.dispose()
    print("Demo data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_demo())
