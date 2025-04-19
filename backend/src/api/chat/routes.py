from fastapi import APIRouter, Body, HTTPException

from src.api.chat.ai_service import ConditionalPipeline
from src.db.repositories import dialog_repository, messages_repository
from src.schemas import CreateMessage, ViewMessage
from src.schemas.chat import Models, Roles

TEST_VALIDATION_PROMPT = """
Check if you have enough data to provide answer to user. Prompt user if you don't have enough data. Do not assume anything.
""".strip()

router = APIRouter(tags=["chat"])


@router.post("/chat/create_message")
async def create_message(dialog_id: int = Body(...), message: str = Body(...)) -> ViewMessage:
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    history = await messages_repository.get_all_dialog_messages(dialog_id)
    last_message = history[-1]
    if last_message and last_message.role == Roles.USER:
        raise HTTPException(400, "last message is already a user message")

    created_message = CreateMessage(
        dialog_id=dialog_id,
        role=Roles.USER,
        content=message,
    )
    created = await messages_repository.create_message(created_message)
    return created


@router.get("/chat/chat_completion")
async def chat_completion(dialog_id: int, model: Models) -> ViewMessage:
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    history = await messages_repository.get_all_dialog_messages(dialog_id)
    last_message = history[-1]
    if last_message and last_message.role != Roles.USER:
        raise HTTPException(400, "last message is already an AI reply")

    pipeline = ConditionalPipeline(
        validation_prompt=TEST_VALIDATION_PROMPT,
        validation_model=Models.GEMMA_3,
        main_model=model,
    )
    assistant_content = await pipeline.run(
        history=history,
    )

    assistant_msg = CreateMessage(
        dialog_id=dialog_id,
        role=Roles.ASSISTANT,
        content=assistant_content,
        reply_to=last_message.id,
        model=model,
    )
    saved_assistant = await messages_repository.create_message(assistant_msg)

    return ViewMessage.model_validate(saved_assistant)


@router.get("/chat/get_history")
async def get_messages(dialog_id: int, amount: int = 0) -> list[ViewMessage]:
    """
    Get n last messages from dialog. To get all messages, set amount to 0.
    """
    if await dialog_repository.get_dialog(dialog_id) is None:
        raise HTTPException(404, f"dialog {dialog_id} not found")

    if amount == 0:
        messages = await messages_repository.get_all_dialog_messages(dialog_id)
    else:
        messages = await messages_repository.get_dialog_messages(dialog_id, amount)

    return messages


@router.delete("/chat/delete_message")
async def delete_message(message_id: int) -> None:
    await messages_repository.delete_message(message_id)


@router.post("/chat/regenerate")
async def regenerate_response(response_id: int) -> ViewMessage:
    response = await messages_repository.get_message_by_id(response_id)
    if response is None:
        raise HTTPException(404, f"Message not found: {response_id}")

    request = await messages_repository.get_request(response_id)
    if request is None:
        raise HTTPException(400, "message is not response")

    await messages_repository.delete_message(response_id)

    history = await messages_repository.get_all_dialog_messages(request.dialog_id)

    pipeline = ConditionalPipeline(
        validation_prompt=TEST_VALIDATION_PROMPT,
        validation_model=Models.LLAMA_3_3,
        main_model=response.model,
    )
    assistant_content = await pipeline.run(
        history=history,
    )

    assistant_msg = CreateMessage(
        dialog_id=request.dialog_id,
        role=Roles.ASSISTANT,
        content=assistant_content,
        model=response.model,
        reply_to=request.id,
    )
    saved_assistant = await messages_repository.create_message(assistant_msg)
    return ViewMessage.model_validate(saved_assistant)
