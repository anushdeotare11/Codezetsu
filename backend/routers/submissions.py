"""
submissions.py - Submission endpoint for SkillSprint.

Exposes a POST /submit route that runs the full evaluation pipeline
and returns the result as JSON.
"""

import json
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from services.pipeline import process_submission


router = APIRouter()

# Resolve the problems JSON path relative to the backend directory
PROBLEMS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "problems.json"


def load_problems() -> list | None:
    """Load the problems list from the JSON file.

    Returns:
        The list of problem dicts, or None if the file is missing.
    """
    try:
        with open(PROBLEMS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


class SubmissionRequest(BaseModel):
    problem: str
    code: str
    language: str


@router.post("/submit")
def submit_code(payload: SubmissionRequest) -> dict:
    """Evaluate a code submission and return feedback with the next problem."""
    problems = load_problems()
    if problems is None:
        return {"error": "Problems data not found"}

    result = process_submission(
        problem=payload.problem,
        code=payload.code,
        language=payload.language,
        problems=problems,
    )
    return result


@router.get("/test-ai")
def test_ai() -> dict:
    """Debug endpoint — runs the pipeline with sample data, no frontend needed."""
    sample_problem = "Write a function that returns the sum of two numbers."
    sample_code = "def add(a, b):\n    return a - b"
    sample_language = "python"

    problems = load_problems()
    if problems is None:
        return {"error": "Problems data not found"}

    return process_submission(
        problem=sample_problem,
        code=sample_code,
        language=sample_language,
        problems=problems,
    )
