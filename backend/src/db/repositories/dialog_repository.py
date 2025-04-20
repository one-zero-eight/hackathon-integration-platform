from typing import Self

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import AbstractSQLAlchemyStorage
from src.db.models import Dialog
from src.schemas import ViewDialog, ViewMessage


class DialogRepository:
    storage: AbstractSQLAlchemyStorage

    def update_storage(self, storage: AbstractSQLAlchemyStorage) -> Self:
        self.storage = storage
        return self

    def _create_session(self) -> AsyncSession:
        return self.storage.create_session()

    async def create_dialog(self) -> ViewDialog:
        async with self._create_session() as session:
            query = insert(Dialog).values().returning(Dialog.id)
            obj = await session.execute(query)
            dialog_id = obj.scalar_one()
            created_dialog = ViewDialog.model_validate(ViewDialog(id=dialog_id))
            await session.commit()
            return created_dialog

    async def get_dialog(self, dialog_id: int) -> ViewDialog | None:
        async with self._create_session() as session:
            query = select(Dialog).where(Dialog.id == dialog_id)
            obj = await session.scalar(query)
            if obj is not None:
                return ViewDialog.model_validate(obj)
            return None

    async def get_all_dialogs(self) -> list[ViewDialog]:
        async with self._create_session() as session:
            query = select(Dialog)
            result = await session.execute(query)
            objs = result.unique().scalars().all()
        return [ViewDialog.model_validate(obj) for obj in objs]

    async def get_dialog_messages(self, dialog_id: int, amount: int | None = None) -> list[ViewMessage] | None:
        async with self._create_session() as session:
            obj = await session.get(Dialog, dialog_id)
            if obj is None:
                return None
            messages = [ViewMessage.model_validate(obj) for obj in obj.messages]
            if amount is not None:
                messages = messages[:amount]
            return messages

    async def delete_dialog(self, dialog_id: int) -> ViewDialog | None:
        async with self._create_session() as session:
            obj = await session.get(Dialog, dialog_id)
            if obj is None:
                return None
            await session.delete(obj)
            await session.commit()
            return ViewDialog.model_validate(obj)


dialog_repository: DialogRepository = DialogRepository()
