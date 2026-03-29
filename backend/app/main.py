from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # registers all models with SQLAlchemy

from app.routers import auth, users, plugins, practice, analytics, planner, integrations, projects

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI CS Student OS — API",
    description="Backend for AI-powered CS placement preparation system",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(plugins.router)
app.include_router(practice.router)
app.include_router(analytics.router)
app.include_router(planner.router)
app.include_router(integrations.router)
app.include_router(projects.router)


@app.get("/")
def root():
    return {
        "status": "running",
        "app": "AI CS Student OS",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
