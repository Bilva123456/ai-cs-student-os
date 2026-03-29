from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.practice import PracticeItem
from app.models.user import User
from app.schemas import AnalyticsOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


def compute_analytics(user_id, db: Session) -> dict:
    items = db.query(PracticeItem).filter(PracticeItem.user_id == user_id).all()
    total = len(items)

    difficulty_counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    status_counts = {"Planned": 0, "Solving": 0, "Mastered": 0}
    topic_map = {}

    for item in items:
        if item.difficulty in difficulty_counts:
            difficulty_counts[item.difficulty] += 1
        if item.status in status_counts:
            status_counts[item.status] += 1
        if item.topic:
            topic_map[item.topic] = topic_map.get(item.topic, 0) + 1

    weaknesses = []
    if total > 0:
        hard_ratio = difficulty_counts["Hard"] / total
        medium_ratio = difficulty_counts["Medium"] / total
        mastery_ratio = status_counts["Mastered"] / total

        if hard_ratio < 0.10:
            weaknesses.append(
                f"Only {difficulty_counts['Hard']} Hard problems ({int(hard_ratio*100)}%) — aim for at least 10%"
            )
        if medium_ratio < 0.30:
            weaknesses.append(
                f"Low Medium problem ratio ({int(medium_ratio*100)}%) — increase medium-difficulty practice"
            )
        if mastery_ratio < 0.20:
            weaknesses.append(
                f"Low mastery rate ({int(mastery_ratio*100)}%) — revisit problems until they are mastered"
            )
    elif total == 0:
        weaknesses.append("No practice items yet — add your first track and problem")

    # Readiness score (0–100)
    score = 0
    if total > 0:
        score += min(difficulty_counts["Hard"] * 3, 30)
        score += min(difficulty_counts["Medium"] * 1.5, 30)
        score += min(status_counts["Mastered"] * 2, 40)

    top_topics = sorted(topic_map.items(), key=lambda x: -x[1])[:5]

    return {
        "total_items": total,
        "difficulty_breakdown": difficulty_counts,
        "status_breakdown": status_counts,
        "top_topics": top_topics,
        "weaknesses": weaknesses,
        "readiness_score": min(int(score), 100),
    }


@router.get("/", response_model=AnalyticsOut)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return compute_analytics(current_user.id, db)
