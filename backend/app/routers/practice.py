from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.practice import PracticeItem
from app.models.plugin import Plugin
from app.models.user import User
from app.schemas import PracticeCreate, PracticeOut, PracticeStatusUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/practice", tags=["practice"])


@router.get("/", response_model=List[PracticeOut])
def list_practice(
    plugin_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(PracticeItem).filter(PracticeItem.user_id == current_user.id)
    if plugin_id:
        q = q.filter(PracticeItem.plugin_id == plugin_id)
    if status:
        q = q.filter(PracticeItem.status == status)
    if difficulty:
        q = q.filter(PracticeItem.difficulty == difficulty)
    return q.order_by(PracticeItem.created_at.desc()).all()


@router.post("/", response_model=PracticeOut)
def create_practice(
    data: PracticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plugin = (
        db.query(Plugin)
        .filter(Plugin.id == data.plugin_id, Plugin.user_id == current_user.id, Plugin.is_active == True)
        .first()
    )
    if not plugin:
        raise HTTPException(status_code=404, detail="Track not found")

    item = PracticeItem(
        user_id=current_user.id,
        plugin_id=data.plugin_id,
        title=data.title.strip(),
        topic=data.topic,
        difficulty=data.difficulty,
        source_link=data.source_link,
        notes=data.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}/status", response_model=PracticeOut)
def update_status(
    item_id: str,
    data: PracticeStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_statuses = {"Planned", "Solving", "Mastered"}
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    item = (
        db.query(PracticeItem)
        .filter(PracticeItem.id == item_id, PracticeItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Practice item not found")

    item.status = data.status
    if data.status == "Mastered":
        item.revision_count += 1
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_practice(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(PracticeItem)
        .filter(PracticeItem.id == item_id, PracticeItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
