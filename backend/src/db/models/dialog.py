from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, relationship

from src.db.__mixin__ import IdMixin
from src.db.models import Base

if TYPE_CHECKING:
    from src.db.models.message import Message


class Dialog(Base, IdMixin):
    __tablename__ = "dialog"

    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="dialog",
        cascade="all, delete-orphan",
        lazy="joined",
    )
