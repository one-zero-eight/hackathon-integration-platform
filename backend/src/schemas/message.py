from pydantic import BaseModel, ConfigDict

from src.schemas.chat import Models, Roles


class ViewMessage(BaseModel):
    id: int
    dialog_id: int
    role: Roles
    message: str
    model: Models | None
    reply_to: int | None

    model_config = ConfigDict(from_attributes=True)


class CreateMessage(BaseModel):
    dialog_id: int
    role: Roles
    message: str
    model: Models | None = None
    reply_to: int | None = None

    model_config = ConfigDict(from_attributes=True)
