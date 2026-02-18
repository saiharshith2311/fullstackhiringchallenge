"""
Pydantic Schemas — Request/Response validation

These define the shape of data flowing in and out of the API.
Pydantic validates types automatically — invalid data gets rejected.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ─── Request Schemas ─────────────────────────────────────────────────────────

class PostCreate(BaseModel):
    """Create a new draft post."""
    title: str = Field(default="Untitled", max_length=255)
    content_json: str = Field(default="{}")


class PostUpdate(BaseModel):
    """Update post content (auto-save hits this)."""
    title: Optional[str] = None
    content_json: Optional[str] = None


class AIGenerateRequest(BaseModel):
    """Request body for AI text generation."""
    text: str = Field(..., min_length=1, max_length=10000)
    action: str = Field(default="summarize")  # "summarize" | "fix_grammar" | "expand"


# ─── Response Schemas ────────────────────────────────────────────────────────

class PostResponse(BaseModel):
    """Response for a single post."""
    id: int
    title: str
    content_json: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows reading from SQLAlchemy models


class AIGenerateResponse(BaseModel):
    """Response from AI generation."""
    result: str
    action: str
