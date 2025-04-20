from contextlib import asynccontextmanager

from fastapi import FastAPI

import src.api.logging_  # noqa: F401
from src.config import api_settings
from src.db import SQLAlchemyStorage
from src.rag import VectorRetriever


async def setup_repositories() -> SQLAlchemyStorage:
    from src.db.repositories import dialog_repository, messages_repository

    storage = SQLAlchemyStorage.from_url(api_settings.db_url.get_secret_value())
    dialog_repository.update_storage(storage)
    messages_repository.update_storage(storage)

    return storage


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Application startup
    storage = await setup_repositories()
    VectorRetriever.init(api_settings.rag_index_path)
    yield
    # Application shutdown
    await storage.close_connection()
