from pathlib import Path

import yaml
from pydantic import BaseModel, ConfigDict, Field, SecretStr


class SettingBaseModel(BaseModel):
    model_config = ConfigDict(use_attribute_docstrings=True, extra="forbid")


class Settings(SettingBaseModel):
    """Settings for the application."""

    model_config = ConfigDict(validate_default=True)

    schema_: str = Field(None, alias="$schema")
    app_root_path: str = ""
    'Prefix for the API path (e.g. "/api/v0")'
    database_uri: SecretStr = "sqlite:///data/db.sqlite"
    "SQLite database settings"
    cors_allow_origin_regex: str = ".*"
    "Allowed origins for CORS: from which domains requests to the API are allowed. Specify as a regex: `https://.*.innohassle.ru`"
    session_secret_key: SecretStr
    "Secret key for session management"
    files_dir: Path = Path("data/files")
    "Path to the directory where files will be stored"
    bot_token: SecretStr
    "Telegram bot token, get it from @BotFather"
    bot_username: str
    "Telegram bot username"
    superadmin_telegram_id: str
    "Telegram ID of the first superadmin"
    default_patrons: list[str] = []
    "List of Telegram IDs of default patrons"

    @classmethod
    def from_yaml(cls, path: Path) -> "Settings":
        with open(path) as f:
            yaml_config = yaml.safe_load(f)

        return cls.model_validate(yaml_config)

    @classmethod
    def save_schema(cls, path: Path) -> None:
        with open(path, "w") as f:
            schema = {"$schema": "https://json-schema.org/draft-07/schema", **cls.model_json_schema()}
            yaml.dump(schema, f, sort_keys=False)
