from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_swagger import patch_fastapi

import api.logging_  # noqa: F401
from src.api.lifespan import lifespan
from src.config import api_settings

app = FastAPI(
    docs_url=None, swagger_ui_oauth2_redirect_url=None, root_path=api_settings.app_root_path, lifespan=lifespan
)
patch_fastapi(app)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=api_settings.cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from src.api.messages.routes import router as messages_router  # noqa: E402

app.include_router(messages_router)
