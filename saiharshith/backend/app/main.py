"""
Smart Blog Editor — FastAPI Backend

Main application entry point.
Configures CORS, includes routers, and creates DB tables on startup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import posts, ai

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Blog Editor API",
    description="A Notion-style blog editor with AI capabilities",
    version="1.0.0"
)

# CORS — allow React dev server to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(posts.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"message": "Smart Blog Editor API is running", "docs": "/docs"}
