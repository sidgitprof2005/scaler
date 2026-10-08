# Typeform Clone

## Features
*   **Drag-and-Drop Form Builder:** Create and reorder questions easily.
*   **Multiple Question Types:** Short text, long text, multiple choice, dropdown, email, number, yes/no, rating.
*   **Live Preview & Publishing:** Toggle form status between Draft and Published.
*   **Conversational Respondent Flow:** Full-screen, animated, one-at-a-time question filling.
*   **Results Dashboard:** View all responses in a structured table format.

## Tech Stack
*   **Frontend:** Next.js (App Router, TypeScript), Tailwind CSS, Framer Motion.
*   **Backend:** Python with FastAPI.
*   **Database:** SQLite with SQLAlchemy.

## Setup Instructions
### Backend

1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload --port 8000`

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the application at `http://localhost:3000`

## Architecture & Database Schema
The backend uses a standard FastAPI layered architecture with SQLAlchemy for ORM.

**Database Schema:**
- **Form:** `id`, `title`, `is_published`, `created_at`
- **Question:** `id`, `form_id`, `type`, `text`, `description`, `is_required`, `order`, `options`
- **Response:** `id`, `form_id`, `submitted_at`
- **Answer:** `id`, `response_id`, `question_id`, `value`

---

## Assumptions / Mocked Data / Notes
*   **Authentication & Users:** The application operates without user authentication or authorization. It assumes a single-tenant environment where anyone can create, edit, or delete forms as the "Creator", and respondents can submit forms anonymously.
*   **Database:** A local SQLite database is used for simplicity, ensuring the backend can be started immediately without external database dependencies (like PostgreSQL/MySQL).
*   **Mocked Data (Seeding):** A `POST /seed/` API endpoint is provided in the backend. Hitting this endpoint populates the database with a mock "Customer Feedback Survey" (containing a short text, rating, and long text question) along with sample responses, making it easy to test the dashboard immediately.
*   **Environment Variables & CORS:** The backend dynamically allows CORS origins via the `FRONTEND_URL` environment variable. The Next.js frontend uses `NEXT_PUBLIC_API_URL` to connect to the backend.
*   **State Management:** React's built-in state (e.g., `useState`, `useEffect`) was assumed to be sufficient for managing the Drag-and-Drop builder and conversational flow, avoiding the overhead of Redux.
*   **Validation:** Basic required-field validation is implemented. Advanced validations (like strictly enforcing email formats or min/max bounds) are kept minimal for the MVP scope.
