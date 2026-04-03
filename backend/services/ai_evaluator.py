"""
ai_evaluator.py - Code evaluation service for SkillSprint.

Uses the Groq/Gemini LLMs to evaluate user-submitted code against a problem
statement, returning structured score, weaknesses, feedback, suggestions, and 
detailed 1-10 metrics for 6 primary skills.
"""

import json

from services.ai_client import call_llm


FALLBACK_RESULT = {
    "score": 5,
    "weaknesses": ["Unknown weaknesses"],
    "feedback": "Could not evaluate properly due to AI error.",
    "suggestions": ["Review logic and standard patterns."],
    "skill_scores": {
        "algorithm_knowledge": 5,
        "data_structures": 5,
        "code_efficiency": 5,
        "edge_cases": 5,
        "readability": 5,
        "problem_solving": 5
    }
}


def evaluate_code(problem: str, code: str, language: str) -> dict:
    """Evaluate submitted code against a problem using the LLM.

    Args:
        problem: The problem statement the code is meant to solve.
        code: The user's submitted source code.
        language: The programming language of the submission.

    Returns:
        A dictionary with structured feedback and detailed skill scores.
    """
    prompt = (
        "You are an expert code evaluator.\n\n"
        f"Problem:\n{problem}\n\n"
        f"Language: {language}\n\n"
        f"Submitted Code:\n{code}\n\n"
        "Evaluate the code using the following criteria. Score everything from 1-10.\n"
        "1. Overall correctness and approach.\n"
        "2. Identify specific weaknesses (bugs, edge-cases, bad practices).\n"
        "3. Provide concise overall feedback.\n"
        "4. Suggest concrete improvements.\n\n"
        "Respond STRICTLY with valid JSON ONLY in this exact format. Do not use markdown blocks:\n"
        "{\n"
        '  "score": <integer 1-10>,\n'
        '  "weaknesses": ["<string>", "<string>"],\n'
        '  "feedback": "<string>",\n'
        '  "suggestions": ["<string>", "<string>"],\n'
        '  "skill_scores": {\n'
        '    "algorithm_knowledge": <integer 1-10>,\n'
        '    "data_structures": <integer 1-10>,\n'
        '    "code_efficiency": <integer 1-10>,\n'
        '    "edge_cases": <integer 1-10>,\n'
        '    "readability": <integer 1-10>,\n'
        '    "problem_solving": <integer 1-10>\n'
        '  }\n'
        "}"
    )

    max_retries = 2
    for attempt in range(max_retries):
        raw = call_llm(prompt)
        
        if raw == "AI_ERROR":
            # If the API completely fails across both Groq and Gemini,
            # we return the fallback immediately.
            return FALLBACK_RESULT.copy()
            
        # Clean up potential markdown formatting wrapping the JSON string
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
            
            # Validation to ensure it has the required exact nested dictionary structure
            if (isinstance(result, dict) and 
                "skill_scores" in result and 
                isinstance(result["skill_scores"], dict)):
                
                # Coerce missing lists to fallback defaults for safety
                if "weaknesses" not in result or not isinstance(result["weaknesses"], list):
                    result["weaknesses"] = FALLBACK_RESULT["weaknesses"]
                    
                if "suggestions" not in result or not isinstance(result["suggestions"], list):
                    result["suggestions"] = FALLBACK_RESULT["suggestions"]
                    
                return result
                
        except json.JSONDecodeError:
            print(f"JSON decode failed on attempt {attempt + 1}. Retrying...")
            continue
            
    # Return fallback after all retries are exhausted
    return FALLBACK_RESULT.copy()
