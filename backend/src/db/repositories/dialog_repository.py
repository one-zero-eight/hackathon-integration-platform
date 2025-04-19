from typing import Self

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import AbstractSQLAlchemyStorage
from src.db.models import Dialog
from src.schemas import ViewDialog


class DialogRepository:
    storage: AbstractSQLAlchemyStorage

    def update_storage(self, storage: AbstractSQLAlchemyStorage) -> Self:
        self.storage = storage
        return self

    def _create_session(self) -> AsyncSession:
        return self.storage.create_session()

    async def create_dialog(self) -> ViewDialog:
        async with self._create_session() as session:
            query = insert(Dialog).values().returning(Dialog)
            obj = await session.scalar(query)
            dialog = ViewDialog.model_validate(obj)
            await session.commit()
            return dialog

    async def get_dialog(self, dialog_id: int) -> ViewDialog | None:
        async with self._create_session() as session:
            query = select(Dialog).where(Dialog.id == dialog_id)
            obj = await session.scalar(query)
            if obj is not None:
                return ViewDialog.model_validate(obj)
            return None


dialog_repository: DialogRepository = DialogRepository()
