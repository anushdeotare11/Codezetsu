"""
pipeline.py - Core execution and evaluation pipeline for SkillSprint.

Integrates AI endpoints efficiently with robust fallback handling and
strictly standardized, internally validated output.
"""

from services.ai_client import call_llm
from services.ai_evaluator import evaluate_code
from services.skill_analyzer import analyze_skills
from services.challenge_generator import generate_ai_problem


def get_standard_output() -> dict:
    """Returns the pure, default schema ensuring no missing fields."""
    return {
        "score": 5,
        "primary_weakness": "general",
        "all_weaknesses": ["general"],
        "skill_scores": {
            "algorithm_knowledge": 5,
            "data_structures": 5,
            "code_efficiency": 5,
            "edge_cases": 5,
            "readability": 5,
            "problem_solving": 5
        },
        "feedback": "Basic evaluation",
        "suggestions": ["Review your approach and practice core logic."],
        "hint": "Try breaking the problem down on paper.",
        "explanation": "Identify the core constraints and iterate efficiently.",
        "insight": "General system feedback mode activated.",
        "next_problem": {
            "title": "Practice Challenge",
            "description": "Please try another problem to hone your skills.",
            "examples": [],
            "tags": ["general"]
        }
    }


def validate_and_fill(raw: dict) -> dict:
    """Validate all fields exist. If missing or invalid type, fill with default."""
    default = get_standard_output()
    if not isinstance(raw, dict):
        return default
        
    # Strings
    for key in ["primary_weakness", "feedback", "hint", "explanation", "insight"]:
        if key not in raw or not isinstance(raw[key], str) or not raw[key]:
            raw[key] = default[key]
            
    # Integers
    for key in ["score"]:
        if key not in raw or not isinstance(raw[key], int):
            raw[key] = default[key]
            
    # Lists
    for key in ["all_weaknesses", "suggestions"]:
        if key not in raw or not isinstance(raw[key], list):
            raw[key] = default[key]
            
    # Nested Dicts: skill_scores
    if "skill_scores" not in raw or not isinstance(raw["skill_scores"], dict):
        raw["skill_scores"] = default["skill_scores"]
    else:
        for sk in default["skill_scores"]:
            if sk not in raw["skill_scores"] or not isinstance(raw["skill_scores"][sk], int):
                raw["skill_scores"][sk] = default["skill_scores"][sk]
                
    # Nested Dicts: next_problem
    if "next_problem" not in raw or not isinstance(raw["next_problem"], dict):
        raw["next_problem"] = default["next_problem"]
    else:
        for pk in ["title", "description"]:
            if pk not in raw["next_problem"] or not isinstance(raw["next_problem"][pk], str):
                raw["next_problem"][pk] = default["next_problem"][pk]
        for pk in ["examples", "tags"]:
            if pk not in raw["next_problem"] or not isinstance(raw["next_problem"][pk], list):
                raw["next_problem"][pk] = default["next_problem"][pk]
                
    return raw


def generate_insight(weakness: str, feedback: str) -> str:
    """Fast, compressed insight generation."""
    clean = weakness.replace('_', ' ') if isinstance(weakness, str) else "general"
    if clean == "general":
        return "Your biggest weakness is general because you need more practice across the board."
        
    prompt = f"Weakness: '{clean}'. Feedback: '{feedback}'. Write EXACTLY ONE sentence starting with 'Your biggest weakness is {clean} because'. No quotes."
    try:
        raw = call_llm(prompt)
        if raw == "AI_ERROR" or not raw:
            return f"Your biggest weakness is {clean} because you scored the lowest in this recent area."
        return raw.strip(' "\'\n')
    except Exception:
        return f"Your biggest weakness is {clean} because of a system parsing error."


def process_submission(problem: str, code: str, language: str) -> dict:
    """Run the end-to-end AI evaluation pipeline for a user submission."""
    raw_response = {}
    
    try:
        # 1. Execute all AI modules
        evaluation = evaluate_code(problem, code, language) or {}
        skill_analysis = analyze_skills(evaluation) or {}
        
        primary_w = skill_analysis.get("primary_weakness", "general")
        next_prob = generate_ai_problem(primary_w) or {}
        insight = generate_insight(primary_w, evaluation.get("feedback", ""))
        
        # 2. Build the unvalidated dictionary
        raw_response = {
            "score": evaluation.get("score"),
            "primary_weakness": primary_w,
            "all_weaknesses": skill_analysis.get("all_weaknesses"),
            "skill_scores": skill_analysis.get("skill_scores"),
            "feedback": evaluation.get("feedback"),
            "suggestions": evaluation.get("suggestions"),
            "hint": evaluation.get("hint"),
            "explanation": evaluation.get("explanation"),
            "insight": insight,
            "next_problem": next_prob
        }

    except Exception as e:
        print(f"Pipeline error handled safely: {e}")
        # raw_response remains empty; validate_and_fill handles fallback completely natively

    # 3. Before returning output: validate all fields exist & map defaults
    return validate_and_fill(raw_response)
