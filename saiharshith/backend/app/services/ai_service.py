"""
AI Service — Gemini API integration for text generation

Uses direct HTTP calls to Gemini API (no SDK version issues).
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


async def generate_ai_response(text: str, action: str) -> str:
    prompts = {
        "summarize": f"Summarize the following text in 2-3 concise sentences:\n\n{text}",
        "fix_grammar": f"Fix the grammar and spelling in the following text. Return only the corrected text, no explanations:\n\n{text}",
        "expand": f"Expand and elaborate on the following text, adding more detail and depth:\n\n{text}",
    }

    prompt = prompts.get(action, prompts["summarize"])

    if not GEMINI_API_KEY:
        return f"[AI {action}] Set GEMINI_API_KEY in backend/.env to enable AI features."

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}]
                }
            )

            if response.status_code == 429:
                return "AI rate limit reached. Please wait a minute and try again, or create a new API key from https://aistudio.google.com/apikey"

            data = response.json()

            if "candidates" in data and len(data["candidates"]) > 0:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            elif "error" in data:
                return f"AI error: {data['error'].get('message', 'Unknown error')}"
            else:
                return "AI returned no response. Try again."

    except Exception as e:
        return f"AI generation failed: {str(e)}"
