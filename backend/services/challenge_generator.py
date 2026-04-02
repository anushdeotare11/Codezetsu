"""
challenge_generator.py - Problem selection for SkillSprint.

Selects the next problem for a user based on their identified weakness,
using simple tag matching with no AI dependency.
"""


def get_next_problem(problems: list, weakness: str) -> dict:
    """Find the first problem whose tags contain the given weakness.

    Args:
        problems: A list of problem dicts, each with a "tags" key.
        weakness: The weakness string to match against problem tags.

    Returns:
        The first matching problem, or the first problem if no match is found.
    """
    weakness_lower = weakness.lower()

    for problem in problems:
        tags = problem.get("tags", [])
        if any(weakness_lower in tag.lower() for tag in tags):
            return problem

    return problems[0] if problems else {}
