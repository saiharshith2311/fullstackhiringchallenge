"""
Posts API Routes — CRUD operations for blog posts

Endpoints:
  POST   /api/posts/           → Create new draft
  GET    /api/posts/           → List all posts
  GET    /api/posts/{id}       → Get single post
  PATCH  /api/posts/{id}       → Update content (auto-save hits this)
  POST   /api/posts/{id}/publish → Change status to published
  DELETE /api/posts/{id}       → Delete post
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Post
from app.schemas import PostCreate, PostUpdate, PostResponse

router = APIRouter(prefix="/api/posts", tags=["Posts"])


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    """Create a new draft post."""
    db_post = Post(
        title=post.title,
        content_json=post.content_json,
        status="draft"
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/", response_model=List[PostResponse])
def list_posts(db: Session = Depends(get_db)):
    """List all posts, most recent first."""
    return db.query(Post).order_by(Post.updated_at.desc()).all()


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post_update: PostUpdate, db: Session = Depends(get_db)):
    """
    Update post content — this is the endpoint auto-save hits.

    Only updates fields that are provided (PATCH semantics).
    This is called every time the user stops typing for 2 seconds.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post_update.title is not None:
        post.title = post_update.title
    if post_update.content_json is not None:
        post.content_json = post_update.content_json

    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/publish", response_model=PostResponse)
def publish_post(post_id: int, db: Session = Depends(get_db)):
    """Change post status from draft to published."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "published"
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/unpublish", response_model=PostResponse)
def unpublish_post(post_id: int, db: Session = Depends(get_db)):
    """Change post status from published back to draft."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = "draft"
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return None
