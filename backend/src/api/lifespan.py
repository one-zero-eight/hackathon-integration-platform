from contextlib import asynccontextmanager

from fastapi import FastAPI

import api.logging_  # noqa: F401
from src.config import settings
from src.db import SQLAlchemyStorage


async def setup_repositories() -> SQLAlchemyStorage:
    from src.db.repositories.messages_repository import messages_repository

    storage = SQLAlchemyStorage.from_url(settings.database_uri.get_secret_value())
    messages_repository.update_storage(storage)

    return storage


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Application startup
    storage = await setup_repositories()
    yield
    # Application shutdown
    await storage.close_connection()
