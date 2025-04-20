from pydantic import BaseModel, ConfigDict

from src.schemas.message import ViewMessage


class ViewDialog(BaseModel):
    id: int
    messages: list[ViewMessage] = []

    model_config = ConfigDict(from_attributes=True)
