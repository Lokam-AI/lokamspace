"""add_is_demo_field

Revision ID: ab0b8045a110
Revises: ff35580cd839
Create Date: 2025-07-06 20:16:41.381966

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab0b8045a110'
down_revision: Union[str, None] = 'ff35580cd839'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_demo field to Call model
    op.add_column('call', sa.Column('is_demo', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add is_demo field to ServiceRecord model
    op.add_column('service_record', sa.Column('is_demo', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove is_demo field from Call model
    op.drop_column('call', 'is_demo')
    
    # Remove is_demo field from ServiceRecord model
    op.drop_column('service_record', 'is_demo') 