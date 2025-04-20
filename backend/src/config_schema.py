from pathlib import Path

import yaml
from pydantic import BaseModel, ConfigDict, Field, SecretStr


class ApiSettings(BaseModel):
    app_root_path: str = Field("")
    'Prefix for the API path (e.g. "/api/v0")'
    cors_allow_origin_regex: str = ".*"
    "Allowed origins for CORS: from which domains requests to the API are allowed."
    db_url: SecretStr = Field(
        ...,
        examples=[
            "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
            "postgresql+asyncpg://postgres:postgres@db:5432/postgres",
        ],
    )
    "PostgreSQL database connection URL"
    session_secret_key: SecretStr = Field(..., example="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    mws_gpt_api_key: SecretStr = Field(..., example="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    "API key of MTS MWS GPT"
    mws_gpt_api_url: str = Field(...)
    "API URL of MTS MWS GPT"
    def_json_documentation_path: str = Field(..., example="data/documentation.pdf")
    "Path to definition json pdf/docx documentation"
    rag_index_path: str = Field(..., example="data/vector.index")
    "Path to indexed documentation"


class Settings(BaseModel):
    model_config = ConfigDict(json_schema_extra={"title": "Settings"}, extra="ignore")
    api_settings: ApiSettings | None = None

    @classmethod
    def from_yaml(cls, path: Path) -> "Settings":
        with open(path, encoding="utf-8") as f:
            yaml_config = yaml.safe_load(f)

        return cls.model_validate(yaml_config)

    @classmethod
    def save_schema(cls, path: Path) -> None:
        with open(path, "w", encoding="utf-8") as f:
            schema = {"$schema": "https://json-schema.org/draft-07/schema", **cls.model_json_schema()}
            yaml.dump(schema, f, sort_keys=False)
