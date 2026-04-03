"""
challenge_generator.py - Problem selection and generation for SkillSprint.

Selects or generates the next coding problem for a user by targeting specific weaknesses.
LLM prompts optimized for token reduction and execution speed.
"""

import json
from services.ai_client import call_llm


FALLBACK_PROBLEM = {
    "title": "Basic Array Filter",
    "description": "Write a function that takes an array of integers and returns only the even numbers.",
    "examples": [
        {"input": "[1, 2, 3]", "output": "[2]"}
    ],
    "tags": ["array", "filtering"]
}

def generate_ai_problem(weakness: str) -> dict:
    """Generate a dynamic coding problem targeting the identified weakness."""
    prompt = (
        f"Create a short coding problem targeting user weakness: '{weakness}'.\n"
        "Return ONLY JSON format:\n"
        '{"title": "Str", "description": "Str", "examples": [{"input": "Str", "output": "Str"}], "tags": ["Str"]}'
    )

    for attempt in range(2):
        raw = call_llm(prompt)
        if raw == "AI_ERROR": return FALLBACK_PROBLEM.copy()

        clean = raw.strip()
        if clean.startswith("```json"): clean = clean[7:]
        elif clean.startswith("```"): clean = clean[3:]
        if clean.endswith("```"): clean = clean[:-3]

        try:
            res = json.loads(clean.strip())
            if isinstance(res, dict) and "title" in res and "description" in res:
                if not isinstance(res.get("examples"), list): res["examples"] = FALLBACK_PROBLEM["examples"]
                if not isinstance(res.get("tags"), list): res["tags"] = [weakness] if isinstance(weakness, str) else ["general"]
                return res
        except json.JSONDecodeError:
            continue
            
    return FALLBACK_PROBLEM.copy()


def get_next_problem(problems: list, weakness: str) -> dict:
    return generate_ai_problem(weakness)
