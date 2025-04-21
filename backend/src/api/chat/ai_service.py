import json
import re
from typing import Any

from fastapi import HTTPException
from httpx import AsyncClient, HTTPStatusError, Timeout

from src.config import api_settings
from src.rag import VectorRetriever
from src.schemas import ViewMessage
from src.schemas.chat import Models, Roles

MWS_GPT_API_ENDPOINT = api_settings.mws_gpt_api_url + "/v1/chat/completions"


async def call_model(
    messages: list[dict[str, str]],
    model: Models,
    temperature: float = 0.5,
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

    INNER_VALIDATION_SYSTEM_PROMPT = """
    Please verify if the following data in the dialog meets the requirements described above.
    Consider the entire conversation context.
    You need to explicitly specify whether the data meet requirements.
    If you consider that data doesn't meet requirements explicitly and in details specify why.
    If you consider that data meets requirements provide very brief explanation without much details.
    Respond strictly in JSON with the shape:
    {"is_valid": bool, "message": string}
    Return json as plain text without any formatting.
    """.strip()

    def __init__(
        self,
        main_system_prompt: str,
        validation_prompt: str,
        validation_model: Models,
        main_model: Models,
        validation_temperature: float = 0.2,
        main_temperature: float = 0.35,
    ):
        self.main_system_prompt = main_system_prompt
        self.validation_prompt = validation_prompt
        self.validation_model = validation_model
        self.main_model = main_model
        self.validation_temperature = validation_temperature
        self.main_temperature = main_temperature

    async def validate(self, history: list[ViewMessage] | None = None) -> dict[str, Any]:
        user_query: str = history[-1].message if history else ""
        doc_ctx: str = VectorRetriever.retrieve(user_query)
        compiled_validation_prompt: str = (
            "You have access to the following documentation. Use that documentation for checking if dialog meets the requirements:\n\n"
            f"{doc_ctx}\n\n"
            "You must strictly follow following validation instructions:\n"
            f"{self.validation_prompt} {self.INNER_VALIDATION_SYSTEM_PROMPT}"
        )

        messages: list[dict[str, str]] = [
            {"role": Roles.SYSTEM.value, "content": compiled_validation_prompt},
        ]
        messages.extend([{"role": msg.role.value, "content": msg.message} for msg in (history or [])])

        raw = await call_model(messages, self.validation_model, self.validation_temperature)

        pattern = r"```(?:json)?\s*(\{.*?\})\s*```"
        match = re.search(pattern, raw, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
        else:
            json_str = raw.strip()

        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return {"is_valid": False, "message": f"Invalid JSON from validator: {json_str}"}

    async def run(
        self,
        history: list[ViewMessage] | None = None,
    ) -> str:
        try:
            result = await self.validate(history)
        except HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.json())

        if not result.get("is_valid"):
            return result.get("message", "Validation failed without message.")

        user_query: str = history[-1].message if history else ""
        doc_ctx: str = VectorRetriever.retrieve(user_query)
        final_system_prompt: str = (
            "You have access to the following documentation:\n\n"
            f"{doc_ctx}\n\n"
            "Answer instructions:\n"
            f"{self.main_system_prompt}"
        )

        messages: list[dict[str, str]] = [{"role": Roles.SYSTEM.value, "content": final_system_prompt}]

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
