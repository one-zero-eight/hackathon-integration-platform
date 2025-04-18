from pydantic import BaseModel


class ViewMessage(BaseModel):
    dialog_id: int
    role: str
    content: str


class CreateMessage(BaseModel):
    dialog_id: int
    role: str
    content: str
