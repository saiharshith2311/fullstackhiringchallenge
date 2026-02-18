# Smart Blog Editor

[Demo Video](https://drive.google.com/file/d/1656u68lr_vU-z_u-ejGTSg1sg8QdPMgr/view?usp=drive_link)

A blog editor I built using React + FastAPI. It's got a Notion-like editing experience with rich text formatting, auto-save, and AI text tools powered by Gemini.

## What it does

- Write blog posts with formatting (bold, italic, headings, lists) using a Lexical-based editor
- Posts auto-save after you stop typing for 2 seconds (debounced)
- AI tools to fix grammar, summarize, or expand your text
- Publish/unpublish posts
- Create, edit, delete multiple posts from the sidebar

## Tech used

**Frontend:** React, Vite, Tailwind CSS, Zustand (state), Lexical (editor)  
**Backend:** Python, FastAPI, SQLAlchemy, SQLite  
**AI:** Google Gemini API

## How to run it

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on http://localhost:8000

For AI features, add your Gemini key in `backend/.env`:

```
GEMINI_API_KEY=your_key_here
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

## How auto-save works

I used a custom debounce hook. The idea is simple - don't hit the API on every keystroke. Instead:

1. User types something
2. A 2-second timer starts
3. If they type again before 2s, timer resets
4. Once they stop for 2s, it saves

This cuts API calls by like 95% compared to saving on every change.

## Project structure

```
SmartBlogEditor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/       # BlogEditor, Toolbar, AIPlugin
│   │   │   ├── Sidebar/      # PostList
│   │   │   └── Layout/       # AppLayout
│   │   ├── store/            # Zustand store
│   │   ├── hooks/            # useDebounce
│   │   └── api/              # API calls (axios)
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routes/           # posts.py, ai.py
│   │   ├── services/         # Gemini AI integration
│   │   ├── models.py         # DB models
│   │   ├── schemas.py        # Request/response validation
│   │   └── main.py           # App entry point
│   └── requirements.txt
└── README.md
```

## Database

Using SQLite with one main table:

- `id` - primary key
- `title` - post title
- `content_json` - editor state stored as JSON (not HTML, so nothing gets lost)
- `status` - draft or published
- `created_at`, `updated_at` - timestamps

## API endpoints

| Method | Endpoint                 | What it does       |
| ------ | ------------------------ | ------------------ |
| GET    | /api/posts/              | Get all posts      |
| POST   | /api/posts/              | Create a post      |
| GET    | /api/posts/:id           | Get one post       |
| PATCH  | /api/posts/:id           | Update a post      |
| DELETE | /api/posts/:id           | Delete a post      |
| POST   | /api/posts/:id/publish   | Publish            |
| POST   | /api/posts/:id/unpublish | Unpublish          |
| POST   | /api/ai/generate         | AI text generation |
