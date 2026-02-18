"""
AI Routes — Text generation endpoints

POST /api/ai/generate → Send text to Gemini API, get AI response back
"""
from fastapi import APIRouter
from app.schemas import AIGenerateRequest, AIGenerateResponse
from app.services.ai_service import generate_ai_response

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/generate", response_model=AIGenerateResponse)
async def generate_text(request: AIGenerateRequest):
    """
    AI text generation endpoint.

    Actions:
      - "summarize": Condense text into a brief summary
      - "fix_grammar": Correct grammar and spelling
      - "expand": Elaborate on the given text
    """
    result = await generate_ai_response(request.text, request.action)
    return AIGenerateResponse(result=result, action=request.action)
