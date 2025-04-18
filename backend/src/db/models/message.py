from sqlalchemy.orm import Mapped, mapped_column

from src.db.__mixin__ import IdMixin
from src.db.models import Base


class Message(Base, IdMixin):
    __tablename__ = 'message'

    dialog_id: Mapped[int] = mapped_column(nullable=False)
    role: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
