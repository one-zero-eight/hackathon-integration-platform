from fastapi import APIRouter, HTTPException
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute

from src.db.repositories import messages_repository
from src.schemas import CreateMessage, ViewMessage

router = APIRouter(tags=["message"], prefix="/message", route_class=AutoDeriveResponsesAPIRoute)


@router.post("/create")
async def create_message(message: CreateMessage) -> ViewMessage:
    """
    Create a new message.
    """
    created = await messages_repository.create_message(message)
    return created


@router.get("/get")
async def get_message(message_id: int) -> ViewMessage:
    """
    Get a message by its ID.
    """
    message = await messages_repository.get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.delete("/delete")
async def delete_message(message_id: int) -> ViewMessage:
    """
    Delete a message by its ID.
    """
    message = await messages_repository.delete_message(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message
