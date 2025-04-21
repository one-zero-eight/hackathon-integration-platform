# MTS True Tech Hack: 🧠 AI JSON Builder Platform

> by One-Zero-Eight

[![Python][Python]][Python-url]
[![uv][uv]][uv-url]
[![FastAPI][FastAPI]][FastAPI-url]  
[![Pydantic][Pydantic]][Pydantic-url]
[![MWS GPT API][MWS-GPT-API]][MWS-GPT-API-url]  
[![LangChain][LangChain]][LangChain-url]
[![Ruff][Ruff]][Ruff-url]  
[![pre-commit][pre-commit]][pre-commit-url]
[![Docker][Docker]][Docker-url]
[![Docker Compose][Docker-Compose]][Docker-Compose-url]

[![NextJS][Nextjs]][Next-url]
[![React][React]][react-url]
[![React Query][react-query]][rq-url]
[![Tailwind][Tailwind CSS]][Tailwind-url]
[![TypeScript][TypeScript]][ts-url]
[![ShadCN UI][Shadcnui]][shadcn-url]
[![pnpm][pnpm]][pnpm-url]
[![Prettier][prettier]][prettier-url]
[![JSON][json]][json-url]

Добро пожаловать! Это **интерактивная платформа на базе ИИ** для генерации структурированных JSON-схем в формате
чат-интерфейса. Система состоит из фронтенд-приложения (Next.js) и бекенд-сервиса (FastAPI), которые работают в связке
для обеспечения бесшовного взаимодействия.

---

## 🌐 Целевой сайт

👉 Деплой по умолчанию доступен по адресу:  
**http://151.242.43.105/** – интерфейс чата  
**http://151.242.43.105/api** – Swagger-документация API

---

## 🚀 Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/one-zero-eight/hackathon-integration-platform.git
cd hackathon-integration-platform
```

### 2. Переменные окружения

```bash
# Скопируйте и настройте конфигурации
cp backend/settings.example.yaml backend/settings.yaml
nano backend/settings.yaml   # При необходимости — см. backend/settings.schema.yaml

cp frontend/.env.example frontend/.env
nano frontend/.env
```

### 3. Локальный запуск

- **Frontend:**
  ```bash
  cd frontend
  pnpm install
  pnpm run dev
  ```

- **Backend:**
  ```bash
  cd backend
  uv pip install -r requirements.txt
  uvicorn main:app --reload
  ```

---

## 🖼️ Демо

_Здесь может быть гифка, демонстрирующая использование платформы:_

![demo](./assets/demo.gif)

---

## 📦 Структура проекта

```text
├── backend/     # FastAPI + LangChain + MWS GPT API
│   ├── settings.example.yaml  # Пример конфигурации
│   └── ...
├── frontend/    # Next.js + React UI
│   ├── .env.example           # Пример переменных окружения
│   └── ...
└── README.md    # Вы здесь :)
```

---

## 🧩 Компоненты

| Название     | Описание                                         | Подробнее                                       |
|--------------|--------------------------------------------------|-------------------------------------------------|
| **Frontend** | Интерфейс на Next.js с Markdown и историей чатов | 📄 [`frontend/README.md`](./frontend/README.md) |
| **Backend**  | FastAPI-сервис с REST API и LLM-обработкой       | 📄 [`backend/README.md`](./backend/README.md)   |

---

## 🧾 Как настроить конфигурации

### 📍 backend/settings.yaml

Создайте файл `settings.yaml` на основе `settings.example.yaml`. В нем указываются ключи доступа к LLM API, параметры
работы модели и пр.  
Подробности в `backend/settings.schema.yaml`.

### 📍 frontend/.env

Создайте `.env` на основе `.env.example` и укажите:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Это URL, по которому фронтенд будет обращаться к бекенду.

---

## 📚 Полезные ссылки

- [Backend API Docs (Swagger UI)](http://localhost:8000/api/docs)
- [Next.js Документация](https://nextjs.org/docs)
- [LangChain](https://www.langchain.com/)
- [MWS GPT API](https://api.gpt.mws.ru/)

---

## 🛠️ Для разработчиков

- Используется `pnpm/npm/yarn/bun` (фронтенд) и `uv` (бекенд) для установки зависимостей.
- Стили — через Tailwind + shadcn/ui.
- Чат использует Markdown-рендеринг и подсветку синтаксиса.

---

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

[NextJS]: https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white

[Next-url]: https://nextjs.org/

[Tailwind CSS]: https://img.shields.io/badge/tailwind-000000?style=for-the-badge&logo=tailwindCSS

[Tailwind-url]: https://tailwindcss.com/

[pnpm]: https://img.shields.io/badge/pnpm-000000.svg?style=for-the-badge&logo=pnpm&logoColor=f69220

[pnpm-url]: https://pnpm.io/

[TypeScript]: https://img.shields.io/badge/typescript-000000.svg?style=for-the-badge&logo=typescript&logoColor=white

[ts-url]: https://www.typescriptlang.org/

[Shadcnui]: https://img.shields.io/badge/shadcn/ui-000000.svg?style=for-the-badge&2F&logo=shadcnui&color=131316

[shadcn-url]: https://ui.shadcn.com/

[json]: https://img.shields.io/badge/json-000000.svg?style=for-the-badge&logo=json&logoColor=white

[json-url]: https://www.json.org/json-en.html

[React]: https://img.shields.io/badge/react-000000.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB

[react-url]: https://react.dev/

[react-query]: https://img.shields.io/badge/React_Query-000000.svg?style=for-the-badge&logo=ReactQuery&logoColor=white

[rq-url]: https://tanstack.com/query/latest/docs/framework/react/overview

[prettier]: https://img.shields.io/badge/prettier-000000.svg?style=for-the-badge&logo=prettier&logoColor=F7BA3E

[prettier-url]: https://prettier.io/