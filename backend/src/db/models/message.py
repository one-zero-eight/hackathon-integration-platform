from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.__mixin__ import IdMixin
from src.db.models import Base


class Message(Base, IdMixin):
    __tablename__ = "message"

    dialog_id: Mapped[int] = mapped_column(nullable=False)
    role: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    reply_to: Mapped[int | None] = mapped_column(ForeignKey("message.id"), nullable=True)

    parent: Mapped["Message"] = relationship(
        "Message",
        back_populates="replies",
        remote_side="Message.id",
        foreign_keys=[reply_to],
    )

    replies: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="parent",
        cascade="all, delete-orphan",
        foreign_keys=[reply_to],
    )
