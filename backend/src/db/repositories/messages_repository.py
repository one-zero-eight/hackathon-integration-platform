from typing import Self

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.db import AbstractSQLAlchemyStorage
from src.db.models import Message
from src.schemas import CreateMessage, ViewMessage


class MessageRepository:
    storage: AbstractSQLAlchemyStorage

    def update_storage(self, storage: AbstractSQLAlchemyStorage) -> Self:
        self.storage = storage
        return self

    def _create_session(self) -> AsyncSession:
        return self.storage.create_session()

    async def create_message(self, message: CreateMessage) -> ViewMessage:
        async with self._create_session() as session:
            query = insert(Message).values(**message.model_dump()).returning(Message)
            obj = await session.scalar(query)
            message = ViewMessage.model_validate(obj)
            await session.commit()
            return message

    async def get_dialog_messages(self, dialog_id: int, amount: int) -> list[ViewMessage]:
        async with self._create_session() as session:
            query = select(Message).where(Message.dialog_id == dialog_id).order_by(Message.id).limit(amount)
            objs = await session.scalars(query)
            return [ViewMessage.model_validate(obj) for obj in objs]

    async def get_message_by_id(self, message_id: int) -> ViewMessage | None:
        async with self._create_session() as session:
            query = select(Message).where(Message.id == message_id)
            obj = await session.scalar(query)
            if obj is not None:
                return ViewMessage.model_validate(obj)
            return None

    async def get_response(self, message_id: int) -> ViewMessage | None:
        async with self._create_session() as session:
            query = select(Message).where(Message.id == message_id)
            message: Message = await session.scalar(query)
            if message.reply is not None:
                return ViewMessage.model_validate(message.reply)
            return None

    async def get_request(self, message_id: int) -> ViewMessage | None:
        async with self._create_session() as session:
            result = await session.execute(
                select(Message).options(joinedload(Message.parent)).where(Message.id == message_id)
            )
            message: Message = result.scalar_one_or_none()
            if not message or not message.parent:
                return None

            return ViewMessage.model_validate(message.parent)

    async def get_reply(self, message_id: int) -> ViewMessage | None:
        async with self._create_session() as session:
            result = await session.execute(
                select(Message).options(joinedload(Message.reply)).where(Message.id == message_id)
            )
            message: Message = result.scalar_one_or_none()
            if not message or not message.reply:
                return None

            return ViewMessage.model_validate(message.parent)

    async def get_all_dialog_messages(self, dialog_id: int) -> list[ViewMessage]:
        async with self._create_session() as session:
            query = select(Message).where(Message.dialog_id == dialog_id).order_by(Message.id)
            result = await session.execute(query)
            objs = result.unique().scalars().all()
        return [ViewMessage.model_validate(obj) for obj in objs]

    async def delete_message(self, message_id: int) -> ViewMessage | None:
        async with self._create_session() as session:
            obj = await session.get(Message, message_id)
            if obj is None:
                return None
            await session.delete(obj)
            await session.commit()
            return ViewMessage.model_validate(obj)


messages_repository: MessageRepository = MessageRepository()
