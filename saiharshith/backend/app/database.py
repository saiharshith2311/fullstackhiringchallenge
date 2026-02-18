"""
Database configuration — SQLite + SQLAlchemy

WHY SQLite?
- Zero setup (no Docker, no server)
- File-based — just a .db file
- Perfect for this scale of app
- Easy to deploy (ships with Python)
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./blog.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite needs this for FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency injection — provides a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
