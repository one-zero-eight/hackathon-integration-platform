from fastapi import APIRouter, HTTPException

from src.db.repositories import dialog_repository
from src.schemas import ViewDialog

router = APIRouter(tags=["dialog"])


@router.post("/dialog/create_dialog")
async def new_dialog() -> ViewDialog:
    created_dialog = await dialog_repository.create_dialog()
    return created_dialog


@router.get("/dialog/get_dialog")
async def get_dialog(dialog_id: int) -> ViewDialog:
    dialog = await dialog_repository.get_dialog(dialog_id)
    if dialog is None:
        raise HTTPException(status_code=404, detail="Dialog not found")
    return dialog
