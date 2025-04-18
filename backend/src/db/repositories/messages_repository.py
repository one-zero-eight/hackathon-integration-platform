from typing import Self

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import AbstractSQLAlchemyStorage
from src.db.models import Message
from src.schemas.message import CreateMessage, ViewMessage


class MessageRepository:
    storage: AbstractSQLAlchemyStorage

    def update_storage(self, storage: AbstractSQLAlchemyStorage) -> Self:
        self.storage = storage
        return self

    def _create_session(self) -> AsyncSession:
        return self.storage.create_session()

    async def create(self, message: CreateMessage) -> ViewMessage:
        async with self._create_session() as session:
            query = insert(Message).values(**message.model_dump()).returning(Message)
            obj = await session.scalar(query)
            message = ViewMessage.model_validate(obj)
            await session.commit()
            return message

    async def get_messages(self, dialog_id: int, amount: int) -> list[ViewMessage]:
        async with self._create_session() as session:
            query = select(Message).where(Message.dialog_id == dialog_id).order_by(Message.id).limit(amount)
            objs = await session.scalars(query)
            return [ViewMessage.model_validate(obj) for obj in objs]


messages_repository: MessageRepository = MessageRepository()
