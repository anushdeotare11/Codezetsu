"""
Gamification service — XP, levels, achievements, streaks, and leaderboard.

Implements the gamification system exactly as defined in the roadmap:
- XP awards per action
- Level progression (10 levels)
- Achievement definitions (10 achievements)
- Streak tracking
- Leaderboard ranking
"""

from datetime import date, timedelta
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import (
    ProfileModel,
    SubmissionModel,
    UserSkillModel,
    UserAchievementModel,
    SubmissionStatus,
)


# =====================
# XP Awards (per roadmap §Gamification System Design)
# =====================

XP_AWARDS = {
    "solve_easy": 50,
    "solve_medium": 100,
    "solve_hard": 200,
    "defeat_boss": 500,
    "first_attempt_bonus": 25,
    "perfect_score_bonus": 50,     # 10/10 AI evaluation
}

# Daily streak bonus: +10 XP × streak_day
STREAK_XP_MULTIPLIER = 10


def calculate_streak_bonus(streak_day: int) -> int:
    """Calculate daily streak bonus XP. Formula: +10 XP × streak_day."""
    return STREAK_XP_MULTIPLIER * streak_day


# =====================
# Level Progression (per roadmap)
# =====================

LEVEL_THRESHOLDS = {
    1: {"xp": 0, "title": "Novice Coder"},
    2: {"xp": 200, "title": "Code Apprentice"},
    3: {"xp": 500, "title": "Bug Squasher"},
    4: {"xp": 1000, "title": "Algorithm Adept"},
    5: {"xp": 2000, "title": "Data Warrior"},
    6: {"xp": 3500, "title": "Efficiency Expert"},
    7: {"xp": 5500, "title": "Pattern Master"},
    8: {"xp": 8000, "title": "Code Architect"},
    9: {"xp": 12000, "title": "Algorithm Legend"},
    10: {"xp": 18000, "title": "Arena Champion"},
}


def get_level_for_xp(xp: int) -> int:
    """Determine level based on total XP."""
    current_level = 1
    for level, info in LEVEL_THRESHOLDS.items():
        if xp >= info["xp"]:
            current_level = level
        else:
            break
    return current_level


def get_level_title(level: int) -> str:
    """Get the title for a given level."""
    return LEVEL_THRESHOLDS.get(level, LEVEL_THRESHOLDS[1])["title"]


def get_xp_for_next_level(current_level: int) -> Optional[int]:
    """Get XP needed for the next level. Returns None if max level."""
    next_level = current_level + 1
    if next_level in LEVEL_THRESHOLDS:
        return LEVEL_THRESHOLDS[next_level]["xp"]
    return None


def get_level_progress(xp: int, current_level: int) -> dict:
    """Get level progress details."""
    current_threshold = LEVEL_THRESHOLDS[current_level]["xp"]
    next_threshold = get_xp_for_next_level(current_level)
    
    if next_threshold is None:
        # Max level
        return {
            "current_level": current_level,
            "title": get_level_title(current_level),
            "xp": xp,
            "xp_in_level": 0,
            "xp_for_next_level": 0,
            "progress_percent": 100.0,
            "is_max_level": True,
        }
    
    xp_in_level = xp - current_threshold
    xp_needed = next_threshold - current_threshold
    progress = (xp_in_level / xp_needed) * 100 if xp_needed > 0 else 100.0
    
    return {
        "current_level": current_level,
        "title": get_level_title(current_level),
        "xp": xp,
        "xp_in_level": xp_in_level,
        "xp_for_next_level": xp_needed,
        "progress_percent": round(progress, 1),
        "is_max_level": False,
    }


# =====================
# Achievement Definitions (per roadmap)
# =====================

ACHIEVEMENTS = {
    "first_blood": {
        "name": "First Blood",
        "emoji": "🏆",
        "description": "Solve your first problem",
    },
    "on_fire": {
        "name": "On Fire",
        "emoji": "🔥",
        "description": "3-day solve streak",
    },
    "lightning_fast": {
        "name": "Lightning Fast",
        "emoji": "⚡",
        "description": "Solve within 5 minutes",
    },
    "big_brain": {
        "name": "Big Brain",
        "emoji": "🧠",
        "description": "Get 10/10 AI evaluation",
    },
    "bug_hunter": {
        "name": "Bug Hunter",
        "emoji": "🐛",
        "description": "Fix a wrong answer on retry",
    },
    "boss_slayer": {
        "name": "Boss Slayer",
        "emoji": "👑",
        "description": "Defeat a Boss Fight",
    },
    "sharpshooter": {
        "name": "Sharpshooter",
        "emoji": "🎯",
        "description": "5 first-attempt solves in a row",
    },
    "growth_mindset": {
        "name": "Growth Mindset",
        "emoji": "📈",
        "description": "Improve weakest skill by 3 points",
    },
    "peak_performance": {
        "name": "Peak Performance",
        "emoji": "🏔️",
        "description": "All skills above 7/10",
    },
    "diamond_coder": {
        "name": "Diamond Coder",
        "emoji": "💎",
        "description": "Reach Level 10",
    },
}


# =====================
# XP Calculation
# =====================

def calculate_xp_for_submission(
    difficulty: str,
    is_accepted: bool,
    is_first_attempt: bool = False,
    ai_score: Optional[int] = None,
    current_streak: int = 0,
) -> int:
    """
    Calculate XP earned for a submission.
    
    Args:
        difficulty: Problem difficulty ('easy', 'medium', 'hard', 'boss')
        is_accepted: Whether the submission was accepted
        is_first_attempt: Whether this is the user's first attempt at this problem
        ai_score: AI evaluation score (1-10)
        current_streak: Current daily solve streak
    
    Returns:
        Total XP earned
    """
    if not is_accepted:
        return 0
    
    # Base XP by difficulty
    difficulty_key = f"solve_{difficulty}"
    if difficulty == "boss":
        difficulty_key = "defeat_boss"
    base_xp = XP_AWARDS.get(difficulty_key, 50)
    
    total_xp = base_xp
    
    # First attempt bonus
    if is_first_attempt:
        total_xp += XP_AWARDS["first_attempt_bonus"]
    
    # Perfect score bonus (10/10 AI evaluation)
    if ai_score is not None and ai_score == 10:
        total_xp += XP_AWARDS["perfect_score_bonus"]
    
    # Streak bonus
    if current_streak > 0:
        total_xp += calculate_streak_bonus(current_streak)
    
    return total_xp


# =====================
# Streak Logic
# =====================

def update_streak(last_solve_date: Optional[date], today: Optional[date] = None) -> dict:
    """
    Calculate updated streak based on last solve date.
    
    Returns dict with:
        - new_streak: Updated streak count
        - streak_broken: Whether the streak was broken
        - is_new_day: Whether this is a new day solve
    """
    if today is None:
        today = date.today()
    
    if last_solve_date is None:
        # First ever solve
        return {
            "new_streak": 1,
            "streak_broken": False,
            "is_new_day": True,
        }
    
    delta = (today - last_solve_date).days
    
    if delta == 0:
        # Same day — no streak change
        return {
            "new_streak": None,  # Keep existing streak
            "streak_broken": False,
            "is_new_day": False,
        }
    elif delta == 1:
        # Consecutive day — streak continues
        return {
            "new_streak": None,  # Will be incremented by +1 by caller
            "streak_broken": False,
            "is_new_day": True,
        }
    else:
        # Gap > 1 day — streak broken, reset to 1
        return {
            "new_streak": 1,
            "streak_broken": True,
            "is_new_day": True,
        }


# =====================
# Achievement Checker
# =====================

async def check_achievements(
    user_id: str,
    db: AsyncSession,
    submission_status: Optional[str] = None,
    problem_difficulty: Optional[str] = None,
    ai_score: Optional[int] = None,
    execution_time_ms: Optional[float] = None,
    current_streak: int = 0,
) -> List[str]:
    """
    Check and unlock achievements after a submission.
    
    Returns list of newly unlocked achievement keys.
    """
    newly_unlocked = []
    
    # Get already-unlocked achievements
    try:
        result = await db.execute(
            select(UserAchievementModel.achievement_key).where(
                UserAchievementModel.user_id == user_id
            )
        )
        existing = set(row[0] for row in result.fetchall())
    except Exception:
        existing = set()
    
    is_accepted = submission_status == SubmissionStatus.ACCEPTED.value
    
    # --- first_blood: Solve your first problem ---
    if is_accepted and "first_blood" not in existing:
        newly_unlocked.append("first_blood")
    
    # --- on_fire: 3-day solve streak ---
    if current_streak >= 3 and "on_fire" not in existing:
        newly_unlocked.append("on_fire")
    
    # --- lightning_fast: Solve within 5 minutes (300,000 ms) ---
    if is_accepted and execution_time_ms is not None:
        if execution_time_ms <= 300000 and "lightning_fast" not in existing:
            newly_unlocked.append("lightning_fast")
    
    # --- big_brain: Get 10/10 AI evaluation ---
    if ai_score is not None and ai_score == 10 and "big_brain" not in existing:
        newly_unlocked.append("big_brain")
    
    # --- boss_slayer: Defeat a Boss Fight ---
    if is_accepted and problem_difficulty == "boss" and "boss_slayer" not in existing:
        newly_unlocked.append("boss_slayer")
    
    # --- bug_hunter: Fix a wrong answer on retry ---
    if is_accepted and "bug_hunter" not in existing:
        try:
            # Check if user had a previous wrong_answer for this problem
            result = await db.execute(
                select(func.count(SubmissionModel.id)).where(
                    SubmissionModel.user_id == user_id,
                    SubmissionModel.status == SubmissionStatus.WRONG_ANSWER.value,
                )
            )
            wrong_count = result.scalar() or 0
            if wrong_count > 0:
                newly_unlocked.append("bug_hunter")
        except Exception:
            pass
    
    # --- diamond_coder: Reach Level 10 ---
    if "diamond_coder" not in existing:
        try:
            result = await db.execute(
                select(ProfileModel.level).where(ProfileModel.id == user_id)
            )
            level = result.scalar()
            if level is not None and level >= 10:
                newly_unlocked.append("diamond_coder")
        except Exception:
            pass
    
    # --- peak_performance: All skills above 7/10 ---
    if "peak_performance" not in existing:
        try:
            result = await db.execute(
                select(UserSkillModel.score).where(
                    UserSkillModel.user_id == user_id
                )
            )
            scores = [float(row[0]) for row in result.fetchall()]
            if scores and len(scores) >= 6 and all(s >= 7.0 for s in scores):
                newly_unlocked.append("peak_performance")
        except Exception:
            pass
    
    # --- sharpshooter: 5 first-attempt solves in a row ---
    if is_accepted and "sharpshooter" not in existing:
        try:
            # Get last 5 distinct problem submissions
            result = await db.execute(
                select(SubmissionModel.problem_id, SubmissionModel.status)
                .where(SubmissionModel.user_id == user_id)
                .order_by(SubmissionModel.created_at.desc())
                .limit(20)
            )
            rows = result.fetchall()
            # Group by problem_id, check if first submission for each was accepted
            seen_problems = []
            for problem_id, status in rows:
                if problem_id not in seen_problems:
                    seen_problems.append(problem_id)
                    if status != SubmissionStatus.ACCEPTED.value:
                        break
                    if len(seen_problems) >= 5:
                        newly_unlocked.append("sharpshooter")
                        break
        except Exception:
            pass
    
    # Persist newly unlocked achievements
    for key in newly_unlocked:
        try:
            achievement = UserAchievementModel(
                user_id=user_id,
                achievement_key=key,
            )
            db.add(achievement)
        except Exception:
            pass
    
    if newly_unlocked:
        try:
            await db.commit()
        except Exception:
            pass
    
    return newly_unlocked


# =====================
# Skill Score Update
# =====================

async def update_user_skills(
    user_id: str,
    skill_scores: Dict[str, int],
    db: AsyncSession,
) -> None:
    """
    Update user skill scores using running average.
    
    Args:
        user_id: User ID
        skill_scores: Dict of skill_name -> score (1-10)
        db: Database session
    """
    for skill_name, new_score in skill_scores.items():
        try:
            result = await db.execute(
                select(UserSkillModel).where(
                    UserSkillModel.user_id == user_id,
                    UserSkillModel.skill_name == skill_name,
                )
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                # Running average: new_avg = (old_avg * count + new_score) / (count + 1)
                old_avg = float(existing.score)
                count = existing.total_assessments
                updated_avg = (old_avg * count + new_score) / (count + 1)
                existing.score = round(updated_avg, 2)
                existing.total_assessments = count + 1
            else:
                new_skill = UserSkillModel(
                    user_id=user_id,
                    skill_name=skill_name,
                    score=new_score,
                    total_assessments=1,
                )
                db.add(new_skill)
        except Exception as e:
            print(f"Warning: Could not update skill {skill_name}: {e}")
    
    try:
        await db.commit()
    except Exception as e:
        print(f"Warning: Could not commit skill updates: {e}")


# =====================
# Leaderboard Query (per roadmap)
# =====================

async def get_leaderboard(db: AsyncSession, limit: int = 10) -> List[dict]:
    """
    Get leaderboard ranked by XP (matches roadmap's leaderboard view).
    
    Returns list of ranked users with:
        rank, username, display_name, avatar_url, xp, level,
        current_streak, problems_solved
    """
    try:
        # Query profiles ordered by XP, join with submission count for problems_solved
        result = await db.execute(
            select(
                ProfileModel.id,
                ProfileModel.username,
                ProfileModel.display_name,
                ProfileModel.avatar_url,
                ProfileModel.xp,
                ProfileModel.level,
                ProfileModel.current_streak,
                func.count(
                    func.distinct(SubmissionModel.problem_id)
                ).filter(
                    SubmissionModel.status == SubmissionStatus.ACCEPTED.value
                ).label("problems_solved"),
            )
            .outerjoin(SubmissionModel, ProfileModel.id == SubmissionModel.user_id)
            .group_by(ProfileModel.id)
            .order_by(desc(ProfileModel.xp))
            .limit(limit)
        )
        rows = result.fetchall()
        
        return [
            {
                "rank": i + 1,
                "username": row.username,
                "display_name": row.display_name,
                "avatar_url": row.avatar_url,
                "xp": row.xp,
                "level": row.level,
                "current_streak": row.current_streak,
                "problems_solved": row.problems_solved or 0,
            }
            for i, row in enumerate(rows)
        ]
    except Exception as e:
        print(f"Leaderboard query failed: {e}")
        return []


# =====================
# Post-Submission Processing
# =====================

async def process_gamification(
    user_id: str,
    problem_difficulty: str,
    is_accepted: bool,
    is_first_attempt: bool,
    ai_score: Optional[int],
    ai_skill_scores: Optional[Dict[str, int]],
    execution_time_ms: float,
    db: AsyncSession,
) -> dict:
    """
    Full gamification processing after a submission.
    
    Returns dict with xp_earned, level_up, new_level, achievements_unlocked.
    """
    result = {
        "xp_earned": 0,
        "level_up": False,
        "new_level": None,
        "old_level": None,
        "achievements_unlocked": [],
    }
    
    try:
        # Get current profile
        profile_result = await db.execute(
            select(ProfileModel).where(ProfileModel.id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            return result
        
        old_level = profile.level
        result["old_level"] = old_level
        
        # Update streak
        streak_info = update_streak(profile.last_solve_date)
        if streak_info["is_new_day"]:
            if streak_info["new_streak"] is not None:
                profile.current_streak = streak_info["new_streak"]
            else:
                profile.current_streak += 1
            
            if profile.current_streak > profile.longest_streak:
                profile.longest_streak = profile.current_streak
            
            profile.last_solve_date = date.today()
        
        # Calculate XP
        xp = calculate_xp_for_submission(
            difficulty=problem_difficulty,
            is_accepted=is_accepted,
            is_first_attempt=is_first_attempt,
            ai_score=ai_score,
            current_streak=profile.current_streak,
        )
        result["xp_earned"] = xp
        
        # Update profile
        if is_accepted:
            profile.xp += xp
            profile.total_solved += 1
            new_level = get_level_for_xp(profile.xp)
            if new_level > old_level:
                profile.level = new_level
                result["level_up"] = True
                result["new_level"] = new_level
        
        await db.commit()
        
        # Update skills
        if ai_skill_scores:
            await update_user_skills(user_id, ai_skill_scores, db)
        
        # Check achievements
        achievements = await check_achievements(
            user_id=user_id,
            db=db,
            submission_status=SubmissionStatus.ACCEPTED.value if is_accepted else SubmissionStatus.WRONG_ANSWER.value,
            problem_difficulty=problem_difficulty,
            ai_score=ai_score,
            execution_time_ms=execution_time_ms,
            current_streak=profile.current_streak,
        )
        result["achievements_unlocked"] = achievements
        
    except Exception as e:
        print(f"Gamification processing error: {e}")
    
    return result
