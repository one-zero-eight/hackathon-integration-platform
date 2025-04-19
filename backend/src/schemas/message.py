from pydantic import BaseModel, ConfigDict


class ViewMessage(BaseModel):
    id: int
    dialog_id: int
    role: str
    content: str
    reply_to: int | None

    model_config = ConfigDict(from_attributes=True)


class CreateMessage(BaseModel):
    dialog_id: int
    role: str
    content: str
    reply_to: int | None = None

    model_config = ConfigDict(from_attributes=True)
