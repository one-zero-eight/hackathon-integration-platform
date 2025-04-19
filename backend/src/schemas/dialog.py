from pydantic import BaseModel, ConfigDict


class ViewDialog(BaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)
