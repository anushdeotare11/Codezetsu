"""
skill_analyzer.py - Skill metrics and weakness extraction for SkillSprint.

Extracts the identified weaknesses and skill metrics from an evaluation result
so downstream modules can generate targeted challenges and update user profiles.
"""

def analyze_skills(evaluation: dict) -> dict:
    """Analyze the evaluation dict to extract skills and find the primary weakness.

    Args:
        evaluation: The evaluation result from ai_evaluator.

    Returns:
        dict: Contains primary_weakness, all_weaknesses, and skill_scores.
    """
    if not isinstance(evaluation, dict):
        evaluation = {}

    # Extract skill_scores safely
    skill_scores = evaluation.get("skill_scores")
    if not isinstance(skill_scores, dict) or not skill_scores:
        skill_scores = {
            "algorithm_knowledge": 5,
            "data_structures": 5,
            "code_efficiency": 5,
            "edge_cases": 5,
            "readability": 5,
            "problem_solving": 5
        }

    # Identify the weakest skill (key with the lowest score)
    primary_weakness = "problem_solving"
    try:
        if skill_scores:
            primary_weakness = min(skill_scores, key=skill_scores.get)
    except Exception:
        pass

    # Extract top 2 weaknesses safely
    raw_weaknesses = evaluation.get("weaknesses", [])
    if not isinstance(raw_weaknesses, list):
        raw_weaknesses = []
        
    all_weaknesses = raw_weaknesses[:2]
    if not all_weaknesses:
        all_weaknesses = [f"Needs improvement in {primary_weakness.replace('_', ' ')}"]

    return {
        "primary_weakness": primary_weakness,
        "all_weaknesses": all_weaknesses,
        "skill_scores": skill_scores
    }
