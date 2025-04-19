from fastapi import APIRouter, HTTPException
from httpx import AsyncClient

from src.config import api_settings
from src.db.repositories.messages_repository import messages_repository
from src.schemas.chat import Models
from src.schemas.message import CreateMessage, ViewMessage

router = APIRouter(tags=["chat"])

MWS_GPT_API_ENDPOINT = "https://api.gpt.mws.ru/v1/chat/completions"


@router.post("/chat/chat_completion", response_model=list[ViewMessage])
async def chat_completion(dialog_id: int, message: str, model: Models) -> list[ViewMessage]:
    history = await messages_repository.get_all_messages(dialog_id)
    payload_msgs = [
        {
            "role": m.role,
            "content": m.content,
        }
        for m in history
    ]
    payload_msgs.append(
        {
            "role": "user",
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
        resp = await client.post(MWS_GPT_API_ENDPOINT, headers=headers, json=payload)

    if resp.status_code != 200:
        raise HTTPException(502, f"GPT API error: {resp.status_code} {resp.text}")

    assistant_content = resp.json()["choices"][0]["message"]["content"]

    async with messages_repository.storage.create_session() as session:
        async with session.begin():
            user_msg = CreateMessage(dialog_id=dialog_id, role="user", content=message)
            saved_user = await messages_repository.create_message(user_msg)

            assistant_msg = CreateMessage(
                dialog_id=dialog_id, role="assistant", content=assistant_content, reply_to=saved_user.id
            )
            saved_assistant = await messages_repository.create_message(assistant_msg)

    return [ViewMessage.model_validate(saved_user), ViewMessage.model_validate(saved_assistant)]
