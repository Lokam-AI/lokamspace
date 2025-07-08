"""add_category_description_to_setting

Revision ID: da8b86355ffb
Revises: 36d3ffc1f9f6
Create Date: 2025-07-05 13:38:59.344571

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da8b86355ffb'
down_revision: Union[str, None] = '36d3ffc1f9f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add category column with default value 'general'
    op.add_column('setting', sa.Column('category', sa.String(50), nullable=False, server_default='general'))
    
    # Add description column (nullable)
    op.add_column('setting', sa.Column('description', sa.Text(), nullable=True))


def downgrade() -> None:
    # Drop columns in reverse order
    op.drop_column('setting', 'description')
    op.drop_column('setting', 'category') 