"""Merge heads after schema reset

Revision ID: aa06ff653683
Revises: 8a7b3c9d2e1f, complete_schema
Create Date: 2025-06-14 22:07:46.926135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa06ff653683'
down_revision: Union[str, None] = ('8a7b3c9d2e1f', 'complete_schema')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
