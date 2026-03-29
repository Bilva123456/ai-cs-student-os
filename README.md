# AI CS Student OS — Bilvarchitha Edition

A full-stack, AI-powered placement preparation system.
**Backend:** FastAPI + PostgreSQL | **Frontend:** React + Vite

---

## Project Structure

```
AI-CS-STUDENT-OS/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app entry point
│   │   ├── config.py            ← Settings from .env
│   │   ├── database.py          ← SQLAlchemy engine + session
│   │   ├── models/              ← User, Plugin, PracticeItem, Project
│   │   ├── routers/             ← auth, users, plugins, practice, analytics, planner, integrations, projects
│   │   ├── schemas/             ← Pydantic request/response models
│   │   └── utils/               ← JWT auth, dependencies
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js        ← Axios client + all API functions
│   │   ├── context/AuthContext.jsx  ← JWT state management
│   │   ├── hooks/useApi.js      ← Data fetching hooks
│   │   ├── components/          ← Layout, Sidebar, UI primitives
│   │   ├── pages/               ← Login, Signup, Dashboard, Practice, Plugins, Analytics, Projects
│   │   ├── App.jsx              ← Routes + protected routes
│   │   └── main.jsx             ← Entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL** (local install or [Supabase](https://supabase.com) / [Neon](https://neon.tech) free tier)

---

## Backend Setup

### 1. Create and activate virtual environment
```bash
cd backend
python -m venv venv

# Linux/Mac:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ai_cs_os
SECRET_KEY=your-random-secret-key-at-least-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=sk-your-key-here    # Optional — app works without it
```

### 4. Create the database
```bash
# Using psql:
psql -U postgres -c "CREATE DATABASE ai_cs_os;"

# Or use Supabase/Neon and paste the connection string in .env
```

### 5. Run the backend
```bash
# From the backend/ directory:
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: **http://127.0.0.1:8000**
Auto-generated docs: **http://127.0.0.1:8000/docs**

> Tables are created automatically on first run via `Base.metadata.create_all()`

---

## Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Run the development server
```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

> The frontend is pre-configured to call `http://127.0.0.1:8000` — no additional config needed for local development.

---

## Running Both Together

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, get JWT |
| GET | `/users/me` | Get current user |
| GET | `/plugins` | List user's tracks |
| POST | `/plugins` | Add new track |
| DELETE | `/plugins/{id}` | Remove track |
| GET | `/practice` | List practice items (filterable) |
| POST | `/practice` | Add practice item |
| PATCH | `/practice/{id}/status` | Update status |
| DELETE | `/practice/{id}` | Delete item |
| GET | `/analytics` | Get performance analytics |
| GET | `/planner/daily-plan` | Get AI daily plan |
| GET | `/integrations/github/{username}` | Fetch GitHub stats |
| GET | `/integrations/leetcode/{username}` | Fetch LeetCode stats |
| GET | `/projects` | List projects |
| POST | `/projects` | Add project |
| PATCH | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |

---

## Features

- **Zero hardcoded data** — everything comes from backend APIs
- **Dynamic tracks** — add LeetCode, SQL, Aptitude, or any custom track
- **Auto platform detection** — adding a "LeetCode" track prompts GitHub/LC connection
- **AI daily plan** — uses OpenAI GPT-4o-mini (falls back gracefully if no API key)
- **Analytics engine** — readiness score, weakness detection, difficulty breakdown
- **JWT auth** — secure login, stored in localStorage, auto-attached to all requests
- **Route protection** — unauthenticated users are redirected to login
- **401 auto-logout** — expired tokens automatically clear session

---

## Production Deployment

**Backend → Railway / Render:**
```bash
# Set environment variables in the dashboard, then:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Frontend → Vercel:**
- Set `VITE_API_URL=https://your-backend.railway.app` in Vercel environment variables
- Update `src/api/client.js` base URL to use `import.meta.env.VITE_API_URL`

**Update CORS** in `backend/app/main.py`:
```python
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app",  # add this
]
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | FastAPI |
| Database ORM | SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-4o-mini |
| External APIs | GitHub REST, LeetCode GraphQL |
| Frontend | React 18 + Vite |
| State | React Context + localStorage |
| HTTP client | Axios |
| Routing | React Router v6 |
| Fonts | Syne + JetBrains Mono |
