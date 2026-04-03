"""
challenge_generator.py - Problem selection and generation for SkillSprint.

Selects or generates the next coding problem for a user by targeting specific weaknesses.
Uses LLM for dynamic problem synthesis.
"""

import json

from services.ai_client import call_llm


FALLBACK_PROBLEM = {
    "title": "Basic Array Filter",
    "description": "Write a function that takes an array of integers and returns only the even numbers.",
    "examples": [
        {"input": "[1, 2, 3, 4, 5, 6]", "output": "[2, 4, 6]"}
    ],
    "tags": ["array", "filtering"]
}


def generate_ai_problem(weakness: str) -> dict:
    """Generate a dynamic coding problem specifically targeting the identified weakness.

    Args:
        weakness: A string representing the weakest skill.

    Returns:
        dict: The problem definition containing title, description, examples, and tags.
    """
    prompt = (
        "You are an expert coding challenge creator.\n"
        f"The user has a weakness in: '{weakness}'.\n\n"
        "Generate a targeted coding problem that helps them practice this specific weakness.\n"
        "Respond STRICTLY with valid JSON ONLY in this exact format. Do not use markdown blocks:\n"
        "{\n"
        '  "title": "<creative string title>",\n'
        '  "description": "<string problem statement>",\n'
        '  "examples": [\n'
        '    {"input": "<string>", "output": "<string>"}\n'
        '  ],\n'
        '  "tags": ["<string>", "<string>"]\n'
        "}"
    )

    max_retries = 2
    for attempt in range(max_retries):
        raw = call_llm(prompt)
        
        if raw == "AI_ERROR":
            return FALLBACK_PROBLEM.copy()

        # Clean JSON in case of markdown wrapping
        clean_raw = raw.strip()
        if clean_raw.startswith("```json"):
            clean_raw = clean_raw[7:]
        elif clean_raw.startswith("```"):
            clean_raw = clean_raw[3:]
            
        if clean_raw.endswith("```"):
            clean_raw = clean_raw[:-3]
            
        clean_raw = clean_raw.strip()

        try:
            result = json.loads(clean_raw)
            
            # Make sure minimum required keys exist
            if isinstance(result, dict) and "title" in result and "description" in result:
                # Type coerce fallback
                if "examples" not in result or not isinstance(result["examples"], list):
                    result["examples"] = FALLBACK_PROBLEM["examples"]
                    
                if "tags" not in result or not isinstance(result["tags"], list):
                    result["tags"] = [weakness] if isinstance(weakness, str) else ["general"]
                    
                return result
                
        except json.JSONDecodeError:
            print(f"JSON decode failed for problem generation on attempt {attempt + 1}. Retrying...")
            continue
            
    return FALLBACK_PROBLEM.copy()


def get_next_problem(problems: list, weakness: str) -> dict:
    """Legacy wrapper: Ignore the static problems list and generate dynamically."""
    return generate_ai_problem(weakness)
