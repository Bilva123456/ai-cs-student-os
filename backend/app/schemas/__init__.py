from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str


# ── User ──────────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None


# ── Plugin ────────────────────────────────────────────────────────────────────
class PluginCreate(BaseModel):
    name: str
    category: str
    type: str


class PluginOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    category: str
    type: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Practice ──────────────────────────────────────────────────────────────────
class PracticeCreate(BaseModel):
    plugin_id: str
    title: str
    topic: Optional[str] = None
    difficulty: str = "Medium"
    source_link: Optional[str] = None
    notes: Optional[str] = None


class PracticeStatusUpdate(BaseModel):
    status: str


class PracticeOut(BaseModel):
    id: UUID
    user_id: UUID
    plugin_id: UUID
    title: str
    topic: Optional[str] = None
    difficulty: str
    status: str
    revision_count: int
    source_link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Project ───────────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    status: str = "Planned"
    progress: int = 0
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ProjectOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    status: str
    progress: int
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analytics ─────────────────────────────────────────────────────────────────
class AnalyticsOut(BaseModel):
    total_items: int
    difficulty_breakdown: dict
    status_breakdown: dict
    top_topics: list
    weaknesses: list
    readiness_score: int


# ── Daily Plan ────────────────────────────────────────────────────────────────
class DailyPlanOut(BaseModel):
    problems: list
    project_task: str
    concept: str
    revision: str
    alerts: list
    mentor_message: str
