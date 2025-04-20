import json
from typing import Any

from fastapi import HTTPException
from httpx import AsyncClient, HTTPStatusError, Timeout

from src.config import api_settings
from src.schemas import ViewMessage
from src.schemas.chat import Models, Roles

MWS_GPT_API_ENDPOINT = api_settings.mws_gpt_api_url + "/v1/chat/completions"


async def call_model(
    messages: list[dict[str, str]],
    model: Models,
    temperature: float = 0.4,
) -> str:
    """
    Make a single chat completion call to the specified model.
    """
    payload = {
        "model": model.value,
        "messages": messages,
        "temperature": temperature,
    }
    headers = {"Authorization": f"Bearer {api_settings.mws_gpt_api_key.get_secret_value()}"}
    async with AsyncClient() as client:
        resp = await client.post(
            MWS_GPT_API_ENDPOINT,
            json=payload,
            headers=headers,
            timeout=Timeout(20, read=None),
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


class ConditionalPipeline:
    """
    Workflow:
      1. Use validation_prompt as a system message
      2. Validate user_input (with conversation history) -> expect JSON { is_valid: bool, message: str }
      3. If invalid -> return validation message
      4. If valid   -> send to main model and return its output
    """

    VALIDATION_SYSTEM_PROMPT = """
    Please verify if the following data in the dialog meets the requirements described above.
    Consider the entire conversation context.
    You need to explicitly specify whether the data meet requirements.
    If you consider that data doesn't meet requirements explicitly and in details specify why.
    Respond strictly in JSON with the shape:
    {"is_valid": bool, "message": string}
    Return json as plain text without any formatting.
    """.strip()
    DEFAULT_MAIN_SYSTEM_PROMPT = "You are a friendly assistant. Provide detailed and helpful answers."

    def __init__(
        self,
        validation_prompt: str,
        validation_model: Models,
        main_model: Models,
        validation_temperature: float = 0.4,
        main_temperature: float = 0.4,
    ):
        self.validation_prompt = validation_prompt
        self.validation_model = validation_model
        self.main_model = main_model
        self.validation_temperature = validation_temperature
        self.main_temperature = main_temperature

    async def validate(self, history: list[ViewMessage] | None = None) -> dict[str, Any]:
        messages: list[dict[str, str]] = [
            {"role": Roles.SYSTEM.value, "content": self.validation_prompt + " " + self.VALIDATION_SYSTEM_PROMPT},
        ]
        messages.extend([{"role": msg.role.value, "content": msg.message} for msg in (history or [])])

        raw = await call_model(messages, self.validation_model, self.validation_temperature)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"is_valid": False, "message": f"Invalid JSON from validator: {raw}"}

    async def run(
        self,
        main_system_prompt: str | None = None,
        history: list[ViewMessage] | None = None,
    ) -> str:
        if main_system_prompt is None:
            main_system_prompt = self.DEFAULT_MAIN_SYSTEM_PROMPT

        try:
            result = await self.validate(history)
        except HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.json())

        if not result.get("is_valid"):
            return result.get("message", "Validation failed without message.")

        messages: list[dict[str, str]] = []

        if main_system_prompt:
            messages.append({"role": Roles.SYSTEM.value, "content": main_system_prompt})

        messages.extend(
            [
                {
                    "role": msg.role.value,
                    "content": msg.message,
                }
                for msg in (history or [])
            ]
        )

        return await call_model(messages, self.main_model, self.main_temperature)
