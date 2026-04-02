"""
pipeline.py - Submission processing pipeline for SkillSprint.

Orchestrates the full evaluation flow: score the code, extract the
weakness, and select the next problem for the user.
"""

from services.ai_evaluator import evaluate_code
from services.skill_analyzer import extract_weakness
from services.challenge_generator import get_next_problem

DEFAULT_NEXT_PROBLEM = {"title": "", "description": ""}


def _normalize_next_problem(problem: dict) -> dict:
    """Ensure next_problem always has title and description."""
    return {
        "title": problem.get("title", ""),
        "description": problem.get("description", ""),
    }


def process_submission(
    problem: str, code: str, language: str, problems: list
) -> dict:
    """Run the full evaluation pipeline on a code submission.

    Args:
        problem: The problem statement the code is meant to solve.
        code: The user's submitted source code.
        language: The programming language of the submission.
        problems: The pool of available problems for next-problem selection.

    Returns:
        A dict containing score, weakness, feedback, suggestions,
        and the recommended next_problem.
    """
    try:
        evaluation = evaluate_code(problem, code, language)
        weakness = extract_weakness(evaluation)
        next_problem = get_next_problem(problems, weakness)

        return {
            "score": evaluation["score"],
            "weakness": weakness,
            "feedback": evaluation["feedback"],
            "suggestions": evaluation["suggestions"],
            "next_problem": _normalize_next_problem(next_problem),
        }
    except Exception:
        return {
            "score": 0,
            "weakness": "error",
            "feedback": "System failed to process submission",
            "suggestions": [],
            "next_problem": DEFAULT_NEXT_PROBLEM.copy(),
        }
