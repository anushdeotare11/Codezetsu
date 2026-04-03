"""AI and code execution services for SkillSprint."""

from .ai_client import call_llm
from .ai_evaluator import evaluate_code, generate_hint, explain_solution
from .skill_analyzer import analyze_skills
from .challenge_generator import generate_ai_problem, get_next_problem
from .code_executor import execute_code
from .pipeline import process_submission
from .gamification import (
    calculate_xp_for_submission,
    get_level_for_xp,
    get_level_title,
    get_level_progress,
    update_streak,
    check_achievements,
    update_user_skills,
    get_leaderboard,
    process_gamification,
    XP_AWARDS,
    LEVEL_THRESHOLDS,
    ACHIEVEMENTS,
)

__all__ = [
    "call_llm",
    "evaluate_code",
    "generate_hint",
    "explain_solution",
    "analyze_skills",
    "generate_ai_problem",
    "get_next_problem",
    "execute_code",
    "process_submission",
    "calculate_xp_for_submission",
    "get_level_for_xp",
    "get_level_title",
    "get_level_progress",
    "update_streak",
    "check_achievements",
    "update_user_skills",
    "get_leaderboard",
    "process_gamification",
    "XP_AWARDS",
    "LEVEL_THRESHOLDS",
    "ACHIEVEMENTS",
]