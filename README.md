# Typeform Clone

This is a fullstack Typeform clone built for the SDE Fullstack Assignment. It features a drag-and-drop form builder, live previews, and a highly polished one-question-at-a-time respondent flow using Framer Motion.

## Features

*   **Drag-and-Drop Form Builder:** Create and reorder questions easily.
*   **Multiple Question Types:** Short text, long text, multiple choice, dropdown, email, number, yes/no, rating.
*   **Live Preview & Publishing:** Toggle form status between Draft and Published.
*   **Conversational Respondent Flow:** Full-screen, animated, one-at-a-time question filling.
*   **Results Dashboard:** View all responses in a structured table format.

## Tech Stack

*   **Frontend:** Next.js (App Router, TypeScript), Tailwind CSS, Framer Motion, dnd-kit.
*   **Backend:** Python with FastAPI.
*   **Database:** SQLite with SQLAlchemy.

## Setup Instructions

### Backend

1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install fastapi uvicorn sqlalchemy pydantic aiosqlite`
5. Run the server: `uvicorn main:app --reload --port 8000`
6. Seed the database (optional): Navigate to `http://localhost:8000/seed/` via POST or run a script.

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install lucide-react framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities axios date-fns clsx tailwind-merge`
3. Run the development server: `npm run dev`
4. Access the application at `http://localhost:3000`

## Architecture & Database Schema

The backend uses a standard FastAPI layered architecture with SQLAlchemy for ORM.

**Database Schema:**
- **Form:** `id`, `title`, `is_published`, `created_at`
- **Question:** `id`, `form_id`, `type`, `text`, `description`, `is_required`, `order`, `options`
- **Response:** `id`, `form_id`, `submitted_at`
- **Answer:** `id`, `response_id`, `question_id`, `value`

## Assumptions Made
- Default logged-in creator (no authentication implemented as per requirements).
- Respondent flow requires no authentication.
