"""change_setting_value_to_jsonb

Revision ID: 34474f15eaea
Revises: da8b86355ffb
Create Date: 2025-07-05 13:46:28.361832

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = '34474f15eaea'
down_revision: Union[str, None] = 'da8b86355ffb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Convert value column from TEXT to JSONB
    op.alter_column('setting', 'value',
                    type_=JSONB,
                    postgresql_using="value::jsonb")


def downgrade() -> None:
    # Convert value column from JSONB back to TEXT
    op.alter_column('setting', 'value',
                    type_=sa.Text,
                    postgresql_using="value::text") 