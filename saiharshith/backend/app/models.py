"""
Database Models — SQLAlchemy ORM

SCHEMA DESIGN DECISION:
We store Lexical's editor state as JSON (not HTML) because:
1. Lexical can perfectly reconstruct the editor from JSON — zero data loss
2. HTML is lossy (loses cursor position, node metadata, etc.)
3. JSON is smaller and faster to parse
4. We can always convert JSON → HTML for display if needed
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), default="Untitled", nullable=False)
    content_json = Column(Text, default="{}", nullable=False)  # Lexical JSON state
    status = Column(String(20), default="draft", nullable=False)  # "draft" | "published"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Post(id={self.id}, title='{self.title}', status='{self.status}')>"
