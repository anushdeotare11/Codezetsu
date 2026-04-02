"""
skill_analyzer.py - Weakness extraction for SkillSprint.

Extracts the identified weakness from an evaluation result
so downstream modules can generate targeted challenges.
"""


def extract_weakness(evaluation: dict) -> str:
    """Extract the weakness string from an evaluation dict.

    Args:
        evaluation: The evaluation result from ai_evaluator.

    Returns:
        The weakness string, or "general" if not present.
    """
    return evaluation.get("weakness", "general") or "general"
