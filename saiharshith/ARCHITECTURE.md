# Architecture

## Overview

The app has two parts - a React frontend and a Python backend. The frontend handles all the editing UI and state, the backend handles storage and AI calls.

```
User <-> React (Lexical editor + Zustand) <-> FastAPI <-> SQLite
                                                    \-> Gemini API
```

## Why these choices

- **Lexical** over Draft.js or Slate because it handles JSON state natively and is actively maintained by Meta
- **JSON storage** instead of HTML because it preserves the exact editor state without any data loss. HTML would strip out metadata
- **SQLite** because there's no setup needed and it works out of the box. For production you'd swap it with PostgreSQL
- **Debounced auto-save** instead of save-on-every-keystroke because that would spam the server with requests

## Frontend

The frontend is split into a few main pieces:

- `components/Editor/` - the actual editor (Lexical wrapper), formatting toolbar, and AI plugin
- `components/Sidebar/` - post list, create/delete posts
- `store/` - Zustand store that holds the current post, editor state, save status
- `hooks/` - custom debounce hook for auto-save
- `api/` - axios functions to talk to the backend

The editor state flows like this:

1. User types -> Lexical fires onChange -> Zustand store gets updated with JSON state
2. AutoSavePlugin watches for changes -> triggers debounced save (waits 2s)
3. After 2s of no typing -> PATCH request goes to backend
4. Backend saves to SQLite -> UI shows "Saved"

## Backend

Standard FastAPI setup:

- `models.py` - SQLAlchemy model for posts (id, title, content_json, status, timestamps)
- `schemas.py` - Pydantic models for request/response validation
- `routes/posts.py` - CRUD endpoints + publish/unpublish
- `routes/ai.py` - sends text to Gemini, returns AI response
- `services/ai_service.py` - handles the actual Gemini API call

## AI flow

1. User selects an action (summarize, fix grammar, expand)
2. Frontend sends the editor text + action to POST /api/ai/generate
3. Backend builds a prompt based on the action and sends it to Gemini
4. Response comes back, frontend appends it to the editor

## What I'd change for production

- Swap SQLite for PostgreSQL
- Add user auth (JWT)
- Add WebSocket for real-time collab
- Rate limit the AI endpoint
- Add proper error handling and loading states everywhere
