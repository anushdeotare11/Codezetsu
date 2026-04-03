"""
pipeline.py - Core execution and evaluation pipeline for SkillSprint.

Integrates the AI evaluator, skill analyzer, and challenge generator
to process a user code submission end-to-end.
"""

from services.ai_client import call_llm
from services.ai_evaluator import evaluate_code
from services.skill_analyzer import analyze_skills
from services.challenge_generator import generate_ai_problem


def generate_insight(weakness: str, feedback: str) -> str:
    """Generate a dynamic, one-sentence insight using the LLM."""
    clean_weakness = weakness.replace('_', ' ')
    prompt = (
        f"The user has a primary weakness in '{clean_weakness}'.\n"
        f"Their code feedback was: '{feedback}'\n\n"
        "Write exactly ONE short, encouraging, and impactful sentence summarizing this. "
        f"It MUST start with exactly: 'Your biggest weakness is {clean_weakness} because '\n"
        "Do not include quotes, markdown, or any other text."
    )
    raw = call_llm(prompt)
    if raw == "AI_ERROR" or not raw:
        return f"Your biggest weakness is {clean_weakness} because it scored the lowest in your recent evaluations."
    return raw.strip(' "\'\n')


def process_submission(problem: str, code: str, language: str) -> dict:
    """Run the end-to-end AI evaluation pipeline for a user submission.

    Args:
        problem: The problem statement the user was solving.
        code: The source code submitted by the user.
        language: The programming language of the submission.

    Returns:
        dict: containing the complete evaluation, skill analysis,
              insight, and dynamically generated next problem.
    """
    try:
        # Step 1: Evaluate the code to get scores, weaknesses, feedback
        evaluation = evaluate_code(problem, code, language)
        
        # Step 2: Analyze skills and extract primary/all weaknesses
        skill_analysis = analyze_skills(evaluation)
        
        # Step 3: Generate the next dynamic problem targeting the primary weakness
        primary_weakness = skill_analysis.get("primary_weakness", "problem_solving")
        next_problem = generate_ai_problem(primary_weakness)
        
        # Step 4: Generate a dynamic impactful insight sentence
        feedback_text = evaluation.get("feedback", "No specific feedback provided.")
        insight = generate_insight(primary_weakness, feedback_text)
        
        # Step 5: Construct the final integrated output mapping
        final_output = {
            "score": evaluation.get("score", 5),
            "primary_weakness": primary_weakness,
            "all_weaknesses": skill_analysis.get("all_weaknesses", []),
            "skill_scores": skill_analysis.get("skill_scores", {}),
            "feedback": feedback_text,
            "suggestions": evaluation.get("suggestions", []),
            "insight": insight,
            "next_problem": next_problem
        }
        
        return final_output

    except Exception as e:
        print(f"Pipeline error processing submission: {e}")
        primary_fallback = "problem_solving"
        
        # Safe fallback structure if the entire pipeline execution crashes
        return {
            "score": 5,
            "primary_weakness": primary_fallback,
            "all_weaknesses": ["General logic errors"],
            "skill_scores": {
                "algorithm_knowledge": 5,
                "data_structures": 5,
                "code_efficiency": 5,
                "edge_cases": 5,
                "readability": 5,
                "problem_solving": 5
            },
            "feedback": "Pipeline encountered a critical error. Defaulting scores.",
            "suggestions": ["Please try submitting your code again."],
            "insight": f"Your biggest weakness is {primary_fallback.replace('_', ' ')} because you had a system error during evaluation.",
            "next_problem": {
                "title": "System Recovery Challenge",
                "description": "Our AI service temporarily failed mapping a challenge. Try resolving this basic logic checkpoint.",
                "examples": [
                    {"input": "True", "output": "True"}
                ],
                "tags": ["fallback", "system"]
            }
        }
