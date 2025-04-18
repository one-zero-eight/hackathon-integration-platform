from fastapi import APIRouter

from src.db.repositories.messages_repository import messages_repository
from src.schemas import CreateMessage, ViewMessage

router = APIRouter(tags=["messages"])


@router.post("/messages/create")
async def create_message(message: CreateMessage) -> ViewMessage:
    created = await messages_repository.create(message)
    return created


@router.get("/messages/get")
async def get_messages(dialog_id: int, amount: int) -> list[ViewMessage]:
    messages = await messages_repository.get_messages(dialog_id, amount)
    return messages
