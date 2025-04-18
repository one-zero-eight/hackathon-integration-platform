from fastapi import APIRouter

from src.db.repositories.messages_repository import messages_repository
from src.schemas import CreateMessage, ViewMessage

router = APIRouter(tags=["messages"])


@router.post("/messages/create")
async def create_message(message: CreateMessage) -> ViewMessage:
    created = await messages_repository.create_message(message)
    return created


@router.get("/messages/get")
async def get_messages(dialog_id: int, amount: int = 0) -> list[ViewMessage]:
    """
    Get n last messages from dialog. To get all messages, set amount to 0.
    """
    if amount == 0:
        messages = await messages_repository.get_all_messages(dialog_id)
    else:
        messages = await messages_repository.get_messages(dialog_id, amount)
    return messages
