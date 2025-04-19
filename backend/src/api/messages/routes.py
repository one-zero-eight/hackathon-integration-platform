from fastapi import APIRouter, HTTPException

from src.db.repositories import messages_repository
from src.schemas import CreateMessage, ViewMessage

router = APIRouter(tags=["messages"])


@router.post("/messages/create")
async def create_message(message: CreateMessage) -> ViewMessage:
    created = await messages_repository.create_message(message)
    return created


@router.get("/messages/get")
async def get_message(message_id: int) -> ViewMessage:
    message = await messages_repository.get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.delete("/messages/delete")
async def delete_message(message_id: int) -> ViewMessage:
    message = await messages_repository.delete_message(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message
