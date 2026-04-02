"""
ai_client.py - Groq LLM client for SkillSprint.

Provides a single function to send prompts to the Groq API
using the llama3-70b-8192 model and return plain text responses.
"""

import os

from groq import Groq


GROQ_MODEL = "llama3-70b-8192"
FALLBACK_RESPONSE = "AI_ERROR"


def call_llm(prompt: str) -> str:
    """Send a prompt to the Groq LLM and return the plain text response.

    Args:
        prompt: The text prompt to send to the model.

    Returns:
        The model's plain text response, or "AI_ERROR" if the call fails.
    """
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except Exception:
        return FALLBACK_RESPONSE
