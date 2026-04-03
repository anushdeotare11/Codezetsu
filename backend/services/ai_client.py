"""
ai_client.py - AI client for SkillSprint with Fallback Logic.

Provides a single function to send prompts to the primary Groq API
(llama3-70b-8192). If it fails, falls back to Google Gemini (gemini-1.5-flash).
Returns plain text responses.
"""

import os

from groq import Groq
import google.generativeai as genai

GROQ_MODEL = "llama3-70b-8192"
GEMINI_MODEL = "gemini-1.5-flash"
FALLBACK_RESPONSE = "AI_ERROR"


def _call_groq(prompt: str) -> str:
    """Make the primary call to Groq."""
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def _call_gemini(prompt: str) -> str:
    """Make the fallback call to Gemini."""
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(prompt)
    return response.text


def call_llm(prompt: str) -> str:
    """Send a prompt to the primary LLM (Groq). If it fails, fallback to Gemini.
    
    Args:
        prompt: The text prompt to send to the model.
        
    Returns:
        The plain text response, or "AI_ERROR" if both fail.
    """
    try:
        return _call_groq(prompt)
    except Exception as groq_error:
        print(f"Groq API failed: {groq_error}. Falling back to Gemini...")
        try:
            return _call_gemini(prompt)
        except Exception as gemini_error:
            print(f"Gemini API also failed: {gemini_error}.")
            return FALLBACK_RESPONSE
