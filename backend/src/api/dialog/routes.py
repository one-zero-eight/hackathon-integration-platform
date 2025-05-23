from fastapi import APIRouter, HTTPException
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute

from src.db.repositories import dialog_repository
from src.schemas import ViewDialog, ViewMessage

router = APIRouter(tags=["dialog"], prefix="/dialog", route_class=AutoDeriveResponsesAPIRoute)


@router.post("/create_dialog")
async def new_dialog() -> ViewDialog:
    """
    Create a new empty dialog.
    """
    created_dialog = await dialog_repository.create_dialog()
    return created_dialog


@router.get("/get_dialog")
async def get_dialog(dialog_id: int) -> ViewDialog:
    """
    Get a dialog by its ID.
    """
    dialog = await dialog_repository.get_dialog(dialog_id)
    if dialog is None:
        raise HTTPException(status_code=404, detail="Dialog not found")
    return dialog


@router.get("/get_existing")
async def get_existing() -> list[ViewDialog]:
    """
    Get all existing dialogs.
    """
    dialogs = await dialog_repository.get_all_dialogs()
    return dialogs


@router.get("/get_history")
async def get_history(dialog_id: int, amount: int | None = None) -> list[ViewMessage]:
    """
    Get n last messages from dialog. Leave amount None to get all messages.
    """
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    messages = await dialog_repository.get_dialog_messages(dialog_id, amount)

    return messages


@router.delete("/delete_dialog")
async def delete_dialog(dialog_id: int) -> ViewDialog:
    """
    Delete a dialog by its ID.
    """
    dialog = await dialog_repository.delete_dialog(dialog_id)
    if dialog is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")
    return dialog
