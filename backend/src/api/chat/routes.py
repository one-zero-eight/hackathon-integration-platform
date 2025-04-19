from fastapi import APIRouter, HTTPException
from httpx import AsyncClient, Timeout

from src.config import api_settings
from src.db.repositories.messages_repository import messages_repository
from src.schemas.chat import Models, Roles
from src.schemas.message import CreateMessage, ViewMessage

router = APIRouter(tags=["chat"])

MWS_GPT_API_ENDPOINT = "https://api.gpt.mws.ru/v1/chat/completions"


async def get_ai_response(history: list[ViewMessage], message: str, model: Models) -> str:
    payload_msgs = [
        {
            "role": m.role.value,
            "content": m.content,
        }
        for m in history
    ]
    payload_msgs.append(
        {
            "role": Roles.USER.value,
            "content": message,
        }
    )

    payload = {
        "model": model.value,
        "messages": payload_msgs,
        "temperature": 0.4,
    }
    headers = {
        "Authorization": f"Bearer {api_settings.mws_gpt_api_key.get_secret_value()}",
    }

    async with AsyncClient() as client:
        resp = await client.post(MWS_GPT_API_ENDPOINT, headers=headers, json=payload, timeout=Timeout(10, read=None))

    if resp.status_code != 200:
        raise HTTPException(502, f"GPT API error: {resp.status_code} {resp.text}")

    return resp.json()["choices"][0]["message"]["content"]


@router.post("/chat/create_message")
async def create_message(dialog_id: int, message: str) -> ViewMessage:
    created_message = CreateMessage(
        dialog_id=dialog_id,
        role=Roles.USER,
        content=message,
    )
    created = await messages_repository.create_message(created_message)
    return created


@router.get("/chat/chat_completion")
async def chat_completion(dialog_id: int, model: Models) -> ViewMessage:
    history = await messages_repository.get_all_dialog_messages(dialog_id)
    last_message = history.pop(-1)
    if last_message.role != Roles.USER.value:
        raise HTTPException(400, "last message is already an AI reply")

    assistant_content = await get_ai_response(history, last_message.content, model)

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

    dialog_id = request.dialog_id
    history = await messages_repository.get_all_dialog_messages(dialog_id)
    try:
        history.remove(request)
    except ValueError:
        pass

    assistant_content = await get_ai_response(history, request.content, response.model)
    assistant_msg = CreateMessage(
        dialog_id=dialog_id,
        role=Roles.ASSISTANT,
        content=assistant_content,
        model=response.model,
        reply_to=request.id,
    )
    saved_assistant = await messages_repository.create_message(assistant_msg)
    return ViewMessage.model_validate(saved_assistant)
