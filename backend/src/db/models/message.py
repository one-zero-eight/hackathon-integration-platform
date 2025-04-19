from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.__mixin__ import IdMixin
from src.db.models import Base

if TYPE_CHECKING:
    from src.db.models.dialog import Dialog


class Message(Base, IdMixin):
    __tablename__ = "message"

    dialog_id: Mapped[int] = mapped_column(ForeignKey("dialog.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    model: Mapped[str] = mapped_column(nullable=True)
    reply_to: Mapped[int | None] = mapped_column(
        ForeignKey("message.id", ondelete="CASCADE"), nullable=True, unique=True
    )

    parent: Mapped["Message"] = relationship(
        "Message",
        back_populates="reply",
        remote_side="Message.id",
        foreign_keys=[reply_to],
        lazy="joined",
    )

    reply: Mapped["Message"] = relationship(
        "Message",
        back_populates="parent",
        cascade="all, delete-orphan",
        foreign_keys=[reply_to],
        uselist=False,
        passive_deletes=True,
        lazy="joined",
    )

    dialog: Mapped["Dialog"] = relationship(
        "Dialog",
        back_populates="messages",
        lazy="joined",
    )
