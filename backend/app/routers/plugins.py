from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.plugin import Plugin
from app.models.user import User
from app.schemas import PluginCreate, PluginOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/plugins", tags=["plugins"])


@router.get("/", response_model=List[PluginOut])
def list_plugins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Plugin)
        .filter(Plugin.user_id == current_user.id, Plugin.is_active == True)
        .order_by(Plugin.created_at.asc())
        .all()
    )


@router.post("/", response_model=PluginOut)
def create_plugin(
    data: PluginCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Track name cannot be empty")

    plugin = Plugin(
        user_id=current_user.id,
        name=data.name.strip(),
        category=data.category.strip(),
        type=data.type.strip(),
    )
    db.add(plugin)
    db.commit()
    db.refresh(plugin)
    return plugin


@router.delete("/{plugin_id}")
def delete_plugin(
    plugin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plugin = (
        db.query(Plugin)
        .filter(Plugin.id == plugin_id, Plugin.user_id == current_user.id)
        .first()
    )
    if not plugin:
        raise HTTPException(status_code=404, detail="Track not found")
    plugin.is_active = False
    db.commit()
    return {"message": "Track removed"}
