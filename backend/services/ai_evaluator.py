"""
ai_evaluator.py - Code evaluation service for SkillSprint.

Uses the Groq LLM to evaluate user-submitted code against a problem
statement, returning a structured score, weaknesses, feedback, and suggestions.
"""

import json

from services.ai_client import call_llm


FALLBACK_RESULT = {
    "score": 5,
    "weakness": "unknown",
    "feedback": "Could not evaluate properly",
    "suggestions": [],
}


def evaluate_code(problem: str, code: str, language: str) -> dict:
    """Evaluate submitted code against a problem using the LLM.

    Args:
        problem: The problem statement the code is meant to solve.
        code: The user's submitted source code.
        language: The programming language of the submission.

    Returns:
        A dict with keys: score, weakness, feedback, suggestions.
    """
    prompt = (
        "You are an expert code evaluator.\n\n"
        f"Problem:\n{problem}\n\n"
        f"Language: {language}\n\n"
        f"Submitted Code:\n{code}\n\n"
        "Evaluate the code on the following criteria:\n"
        "1. Correctness - does it solve the problem?\n"
        "2. Weaknesses - any bugs, edge-case failures, or bad practices?\n"
        "3. Feedback - a concise overall assessment.\n"
        "4. Suggestions - concrete improvements the student should make.\n\n"
        "Respond with ONLY valid JSON in this exact format, nothing else:\n"
        "{\n"
        '  "score": <integer 1-10>,\n'
        '  "weakness": "<string>",\n'
        '  "feedback": "<string>",\n'
        '  "suggestions": ["<string>", ...]\n'
        "}"
    )

    raw = call_llm(prompt)

    if raw == "AI_ERROR":
        return FALLBACK_RESULT.copy()

    try:
        result = json.loads(raw)
        # Validate expected keys and types
        if not isinstance(result.get("score"), int):
            return FALLBACK_RESULT.copy()
        if not isinstance(result.get("weakness"), str):
            return FALLBACK_RESULT.copy()
        if not isinstance(result.get("feedback"), str):
            return FALLBACK_RESULT.copy()
        if not isinstance(result.get("suggestions"), list):
            return FALLBACK_RESULT.copy()
        return result
    except (json.JSONDecodeError, TypeError, KeyError):
        return FALLBACK_RESULT.copy()
