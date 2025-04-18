from pydantic import BaseModel, ConfigDict


class ViewMessage(BaseModel):
    id: int
    dialog_id: int
    role: str
    content: str

    model_config = ConfigDict(from_attributes=True)


class CreateMessage(BaseModel):
    dialog_id: int
    role: str
    content: str
