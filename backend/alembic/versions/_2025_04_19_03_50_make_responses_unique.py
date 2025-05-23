"""make responses unique

Revision ID: 28cba249bf24
Revises: 70cce2a57bef
Create Date: 2025-04-19 03:50:52.980095

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "28cba249bf24"
down_revision: str | None = "70cce2a57bef"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, "message", ["reply_to"])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "message", type_="unique")
    # ### end Alembic commands ###
