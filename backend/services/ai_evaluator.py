"""
ai_evaluator.py - Code evaluation service for SkillSprint.

Uses the Groq/Gemini LLMs to evaluate user-submitted code against a problem.
Optimized prompts for <3s response time while maintaining strict JSON format.
"""

import json
from services.ai_client import call_llm

FALLBACK_RESULT = {
    "score": 5,
    "weaknesses": ["Unknown weaknesses"],
    "feedback": "Could not evaluate properly due to AI error.",
    "suggestions": ["Review logic and standard patterns."],
    "hint": "Try breaking the problem down into smaller steps.",
    "explanation": "Identify the core constraints and use iterative logic.",
    "skill_scores": {
        "algorithm_knowledge": 5, "data_structures": 5, "code_efficiency": 5,
        "edge_cases": 5, "readability": 5, "problem_solving": 5
    }
}

def _clean_and_parse_json(raw_text: str) -> dict:
    """Aggressively attempt to parse JSON from a noisy LLM response."""
    clean_raw = raw_text.strip()
    if clean_raw.startswith("```json"): clean_raw = clean_raw[7:]
    elif clean_raw.startswith("```"): clean_raw = clean_raw[3:]
    if clean_raw.endswith("```"): clean_raw = clean_raw[:-3]
    clean_raw = clean_raw.strip()

    try: return json.loads(clean_raw)
    except json.JSONDecodeError: pass

    start_idx = raw_text.find('{')
    end_idx = raw_text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        try: return json.loads(raw_text[start_idx:end_idx+1])
        except json.JSONDecodeError: pass

    raise ValueError("Could not parse JSON from LLM response.")

def generate_hint(problem: str) -> str:
    prompt = f"Problem:\n{problem}\nProvide ONE short conceptual hint (under 2 sentences). No code."
    raw = call_llm(prompt)
    if raw == "AI_ERROR" or not raw: return FALLBACK_RESULT["hint"]
    return raw.strip(' "\'\n')

def explain_solution(problem: str) -> str:
    prompt = f"Problem:\n{problem}\nExplain the optimal approach conceptually in 2 sentences. No code."
    raw = call_llm(prompt)
    if raw == "AI_ERROR" or not raw: return FALLBACK_RESULT["explanation"]
    return raw.strip(' "\'\n')

def evaluate_code(problem: str, code: str, language: str) -> dict:
    """Evaluate submitted code against a problem using the LLM with ultra-concise prompt logic."""
    prompt = f"""Evaluate this {language} submission.
Problem: {problem}
Code:
{code}

Return ONLY standard JSON representing out-of-10 skill scores, critique, and improvements.
Use the following format EXACTLY:
{{
  "score": 7,
  "weaknesses": ["O(n^2) time complexity", "Missed empty edge case"],
  "feedback": "Logic works but nested loops scale poorly. Fails on empty arrays.",
  "suggestions": ["Use a HashMap for O(1) lookups", "Add early return for lengths < 2"],
  "hint": "Consider tracking seen elements in a dictionary.",
  "explanation": "The optimal approach leverages a HashMap to process elements in O(n) time.",
  "skill_scores": {{"algorithm_knowledge": 6, "data_structures": 5, "code_efficiency": 4, "edge_cases": 5, "readability": 8, "problem_solving": 7}}
}}

Example Good Execution:
Problem: Two Sum
Code: 
def twoSum(nums, target):
    seen = {{}}
    for i, num in enumerate(nums):
        if target - num in seen: return [seen[target - num], i]
        seen[num] = i
JSON:
{{
  "score": 10,
  "weaknesses": [],
  "feedback": "Flawless O(n) execution using a dictionary.",
  "suggestions": [],
  "hint": "None needed.",
  "explanation": "Using a hash map gives O(1) lookup.",
  "skill_scores": {{"algorithm_knowledge": 10, "data_structures": 10, "code_efficiency": 10, "edge_cases": 10, "readability": 10, "problem_solving": 10}}
}}
"""

    for attempt in range(2):
        try:
            raw = call_llm(prompt)
            if raw == "AI_ERROR": return FALLBACK_RESULT.copy()
            
            res = _clean_and_parse_json(raw)
            if isinstance(res, dict) and isinstance(res.get("skill_scores"), dict):
                for key in ["weaknesses", "suggestions"]:
                    if not isinstance(res.get(key), list): res[key] = FALLBACK_RESULT[key]
                for key in ["hint", "explanation"]:
                    if not isinstance(res.get(key), str): res[key] = FALLBACK_RESULT[key]
                return res
        except Exception as e:
            print(f"Decode failed (attempt {attempt + 1}): {e}")
            continue
            
    return FALLBACK_RESULT.copy()
