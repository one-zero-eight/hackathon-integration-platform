from fastapi import APIRouter, Body, HTTPException
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute

from src.api.chat.ai_service import ConditionalPipeline
from src.api.chat.constants import SYSTEM_PROMPT, VALIDATION_PROMPT
from src.db.repositories import dialog_repository, messages_repository
from src.schemas import CreateMessage, ViewMessage
from src.schemas.chat import Models, Roles

router = APIRouter(tags=["chat"], prefix="/chat", route_class=AutoDeriveResponsesAPIRoute)


@router.post("/create_message")
async def create_message(dialog_id: int = Body(...), message: str = Body(...)) -> ViewMessage:
    """
    Create a new user message in a specified dialog.
    """
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    history = await messages_repository.get_all_dialog_messages(dialog_id)
    last_message = history[-1] if history else None
    if last_message and last_message.role == Roles.USER:
        raise HTTPException(400, "last message is already a user message")

    created_message = CreateMessage(
        dialog_id=dialog_id,
        role=Roles.USER,
        message=message,
    )
    created = await messages_repository.create_message(created_message)
    return created


@router.get("/chat_completion")
async def chat_completion(dialog_id: int, model: Models) -> ViewMessage:
    """
    Generate an AI response to the last user message in a dialog.
    """
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    history = await messages_repository.get_all_dialog_messages(dialog_id)
    last_message = history[-1] if history else None
    if last_message and last_message.role != Roles.USER:
        raise HTTPException(400, "last message is already an AI reply")

    pipeline = ConditionalPipeline(
        main_system_prompt=SYSTEM_PROMPT,
        validation_prompt=VALIDATION_PROMPT,
        validation_model=Models.GEMMA_3,
        main_model=model,
    )
    assistant_content = await pipeline.run(
        history=history,
    )

    assistant_msg = CreateMessage(
        dialog_id=dialog_id,
        role=Roles.ASSISTANT,
        message=assistant_content,
        reply_to=last_message.id,
        model=model,
    )
    saved_assistant = await messages_repository.create_message(assistant_msg)

    return ViewMessage.model_validate(saved_assistant)


@router.get("/get_history", deprecated=True)
async def get_messages(dialog_id: int, amount: int = 0) -> list[ViewMessage]:
    """
    Get n last messages from dialog. To get all messages, set amount to 0.
    NOTE: that endpoint is deprecated and left for compatibility. Consider using `/dialog/get_history` instead.
    """
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    if amount == 0:
        messages = await messages_repository.get_all_dialog_messages(dialog_id)
    else:
        messages = await messages_repository.get_dialog_messages(dialog_id, amount)

    return messages


@router.delete("/delete_message")
async def delete_message(message_id: int) -> ViewMessage:
    """
    Delete a user message by its ID.
    """
    message = await messages_repository.get_message_by_id(message_id)
    if not message:
        raise HTTPException(404, f"message {message_id} not found")
    if message.role != Roles.USER:
        raise HTTPException(400, "You can only delete messages from user")
    return await messages_repository.delete_message(message_id)


@router.post("/regenerate")
async def regenerate_response(message_id: int) -> ViewMessage:
    """
    Regenerate an AI response for a given message ID.
    """
    response = await messages_repository.get_message_by_id(message_id)
    if response is None:
        raise HTTPException(404, f"Message not found: {message_id}")

    request = await messages_repository.get_request(message_id)
    if request is None:
        raise HTTPException(400, "message is not response")

    await messages_repository.delete_message(message_id)

    history = await messages_repository.get_all_dialog_messages(request.dialog_id)

    pipeline = ConditionalPipeline(
        main_system_prompt=SYSTEM_PROMPT,
        validation_prompt=VALIDATION_PROMPT,
        validation_model=Models.GEMMA_3,
        main_model=response.model,
    )
    assistant_content = await pipeline.run(
        history=history,
    )

    assistant_msg = CreateMessage(
        dialog_id=request.dialog_id,
        role=Roles.ASSISTANT,
        message=assistant_content,
        model=response.model,
        reply_to=request.id,
    )
    saved_assistant = await messages_repository.create_message(assistant_msg)
    return ViewMessage.model_validate(saved_assistant)
