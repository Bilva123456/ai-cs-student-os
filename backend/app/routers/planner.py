from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas import DailyPlanOut
from app.utils.dependencies import get_current_user
from app.routers.analytics import compute_analytics
from app.config import settings
import json

router = APIRouter(prefix="/planner", tags=["planner"])


def _build_plan_without_ai(analytics: dict, user_name: str) -> dict:
    """Fallback plan when OpenAI is not configured."""
    d = analytics["difficulty_breakdown"]
    s = analytics["status_breakdown"]
    total = analytics["total_items"]

    # Suggest based on weakest area
    if d["Hard"] == 0:
        problems = [
            "Solve a Hard difficulty problem in your weakest topic",
            "Attempt one Medium problem you've been avoiding",
            "Re-solve a Medium problem from scratch without notes",
        ]
    elif d["Medium"] < 3:
        problems = [
            "Solve 2 Medium problems today",
            "Revisit an Easy problem and optimize the solution",
            "Read editorial for one Hard problem you attempted",
        ]
    else:
        problems = [
            "Tackle one Hard problem with 45-minute timer",
            "Solve one Medium problem in under 20 minutes",
            "Review and document one previously solved problem",
        ]

    alerts = analytics["weaknesses"]

    score = analytics["readiness_score"]
    if score < 30:
        message = "Your readiness score is critically low. Focus on volume and consistency."
    elif score < 60:
        message = "Decent progress, but Hard problems are too few. Push difficulty now."
    else:
        message = "Good momentum. Start mock interviews to test your preparation."

    return {
        "problems": problems,
        "project_task": "Update your portfolio README with a live demo link and tech stack description",
        "concept": "Study time and space complexity — be able to explain Big-O for every solution",
        "revision": f"Re-solve your last 3 Mastered problems ({s['Mastered']} total mastered) without looking at notes",
        "alerts": alerts,
        "mentor_message": message,
    }


@router.get("/daily-plan", response_model=DailyPlanOut)
async def daily_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics = compute_analytics(current_user.id, db)

    if not settings.openai_api_key or settings.openai_api_key == "sk-your-openai-key-here":
        return _build_plan_without_ai(analytics, current_user.name)

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)

        prompt = f"""You are a strict CS placement mentor for {current_user.name}.
Generate a focused daily plan based on this performance data.
Be direct. No motivation. Be specific and actionable.

PERFORMANCE:
- Total problems: {analytics['total_items']}
- Easy: {analytics['difficulty_breakdown']['Easy']}, Medium: {analytics['difficulty_breakdown']['Medium']}, Hard: {analytics['difficulty_breakdown']['Hard']}
- Mastered: {analytics['status_breakdown']['Mastered']}, Solving: {analytics['status_breakdown']['Solving']}, Planned: {analytics['status_breakdown']['Planned']}
- Readiness score: {analytics['readiness_score']}/100
- Weaknesses: {', '.join(analytics['weaknesses']) or 'None detected'}
- Top topics: {analytics['top_topics']}

Return ONLY valid JSON:
{{
  "problems": ["specific problem 1 with topic", "specific problem 2", "specific problem 3"],
  "project_task": "one specific project task",
  "concept": "one specific concept to study",
  "revision": "what exactly to revise",
  "alerts": ["alert 1 if any"],
  "mentor_message": "one harsh but useful line"
}}"""

        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=600,
        )
        return json.loads(resp.choices[0].message.content)

    except Exception:
        return _build_plan_without_ai(analytics, current_user.name)
