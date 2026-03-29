from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas import UserOut, UserUpdate
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.github_username is not None:
        current_user.github_username = data.github_username.strip() or None
    if data.leetcode_username is not None:
        current_user.leetcode_username = data.leetcode_username.strip() or None
    db.commit()
    db.refresh(current_user)
    return current_user
