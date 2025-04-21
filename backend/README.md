# Backend - MWS AI JSON Builder

[![Python][Python]][Python-url] [![uv][uv]][uv-url] [![FastAPI][FastAPI]][FastAPI-url]  
[![Pydantic][Pydantic]][Pydantic-url] [![MWS GPT API][MWS-GPT-API]][MWS-GPT-API-url]  
[![LangChain][LangChain]][LangChain-url] [![Ruff][Ruff]][Ruff-url]  
[![pre-commit][pre-commit]][pre-commit-url] [![Docker][Docker]][Docker-url] [![Docker Compose][Docker-Compose]][Docker-Compose-url]

---

## 🛠️ Deployment

```bash
# 1. Copy config template
cp settings.example.yaml settings.yaml

# 2. Configure your settings
nano settings.yaml  # (refer to settings.schema.yaml for details)

# 3. Build & run
docker compose build --pull
docker compose up --detach

# 4. Monitor logs
docker compose logs -f
```

---

## 📚 API Endpoints

Explore interactive docs at `/docs` (Swagger UI)  
All endpoints return JSON and use standard HTTP status codes.

### 💬 **Messages API**  
_For direct message management (use /chat for safer interface)_

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/message/create` | `POST` | Create new message | `CreateMessage` object |
| `/message/get` | `GET` | Get message by ID | `message_id` (int) |
| `/message/delete` | `DELETE` | Delete message | `message_id` (int) |

**Example Request:**
```http
POST /message/create
Content-Type: application/json

{
  "dialog_id": 42,
  "role": "user",
  "message": "Hello AI!"
}
```

---

### 🗂️ **Dialogs API**  
_Manage conversation containers_

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/dialog/create_dialog` | `POST` | Create empty dialog | - |
| `/dialog/get_dialog` | `GET` | Get dialog metadata | `dialog_id` |
| `/dialog/get_existing` | `GET` | List all dialogs | - |
| `/dialog/get_history` | `GET` | Get message history | `dialog_id`, `amount` (optional) |
| `/dialog/delete_dialog` | `DELETE` | Remove dialog | `dialog_id` |

---

### 🤖 **Chat API**  
_Conversational interface with LLM_

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/chat/create_message` | `POST` | Add user message | `dialog_id`, `message` |
| `/chat/chat_completion` | `GET` | Get AI response | `dialog_id`, `model` |
| `/chat/regenerate` | `POST` | Regenerate AI reply | `message_id` |
| `/chat/delete_message` | `DELETE` | Remove user message | `message_id` |

**Typical Flow:**
1. Create dialog → `/dialog/create_dialog`
2. Post message → `/chat/create_message`
3. Get AI reply → `/chat/chat_completion`
4. Repeat 2-3 as needed

---

## 🔧 Tech Stack

| Component | Description |
|-----------|-------------|
| **Python 3.12** | Core runtime |
| **FastAPI** | Modern async framework |
| **Pydantic** | Data validation & settings |
| **MWS GPT API** | AI capabilities |
| **LangChain** | LLM integration |
| **Docker** | Containerization |

---

## ⚠️ Deprecation Notice
`/chat/get_history` → Use `/dialog/get_history` instead

[Python]: https://img.shields.io/badge/Python_3.12-000000?style=for-the-badge&logo=python
[Python-url]: https://www.python.org/downloads/
[uv]: https://img.shields.io/badge/uv-000000?style=for-the-badge&logo=python
[uv-url]: https://github.com/astral-sh/uv
[FastAPI]: https://img.shields.io/badge/FastAPI-000000?style=for-the-badge&logo=fastapi
[FastAPI-url]: https://fastapi.tiangolo.com/
[Pydantic]: https://img.shields.io/badge/Pydantic-000000?style=for-the-badge&logo=pydantic
[Pydantic-url]: https://docs.pydantic.dev/latest/
[MWS-GPT-API]: https://img.shields.io/badge/MWS_GPT_API-000000?style=for-the-badge&logo=openai
[MWS-GPT-API-url]: https://api.gpt.mws.ru/
[LangChain]: https://img.shields.io/badge/LangChain-000000?style=for-the-badge&logo=langchain
[LangChain-url]: https://www.langchain.com/
[Ruff]: https://img.shields.io/badge/Ruff-000000?style=for-the-badge&logo=ruff
[Ruff-url]: https://docs.astral.sh/ruff/
[pre-commit]: https://img.shields.io/badge/pre--commit-000000?style=for-the-badge&logo=pre-commit
[pre-commit-url]: https://pre-commit.com/
[Docker]: https://img.shields.io/badge/Docker-000000?style=for-the-badge&logo=docker
[Docker-url]: https://www.docker.com/
[Docker-Compose]: https://img.shields.io/badge/Docker_Compose-000000?style=for-the-badge&logo=docker
[Docker-Compose-url]: https://docs.docker.com/compose/
