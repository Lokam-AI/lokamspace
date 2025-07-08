"""configuration_settings_integration

Revision ID: 36d3ffc1f9f6
Revises: 1f82a9dc57f8
Create Date: 2025-07-05 13:09:38.400237

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision: str = '36d3ffc1f9f6'
down_revision: Union[str, None] = '1f82a9dc57f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add service_center_description to organization table
    op.add_column('organization', sa.Column('service_center_description', sa.Text(), nullable=True))
    
    # Add topic field to inquiry table
    # Check if the inquiry table exists
    try:
        op.add_column('inquiry', sa.Column('topic', sa.String(length=100), nullable=True))
    except Exception as e:
        print(f"Failed to add topic column to inquiry table: {e}")
        print("Skipping this step...")
    
    # Check if dms_integration table exists, if not create it
    conn = op.get_bind()
    result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dms_integration')"))
    table_exists = result.scalar()
    
    if not table_exists:
        print("Creating dms_integration table since it doesn't exist...")
        op.create_table('dms_integration',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('type', sa.String(length=50), nullable=False),
            sa.Column('config', postgresql.JSONB(), nullable=False),
            sa.Column('timeout_seconds', sa.Integer(), server_default='20', nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
            sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    else:
        # Add timeout_seconds to dms_integration table if the table exists
        try:
            op.add_column('dms_integration', sa.Column('timeout_seconds', sa.Integer(), server_default='20', nullable=True))
        except Exception as e:
            print(f"Failed to add timeout_seconds to dms_integration table: {e}")
            print("Skipping this step...")
    
    # Check if knowledge_file table exists
    result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knowledge_file')"))
    knowledge_file_exists = result.scalar()
    
    if not knowledge_file_exists:
        # Create knowledge_file table
        print("Creating knowledge_file table...")
        op.create_table('knowledge_file',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('file_path', sa.String(length=255), nullable=False),
            sa.Column('file_size', sa.Integer(), nullable=False),
            sa.Column('file_type', sa.String(length=50), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('uploaded_by', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], ),
            sa.ForeignKeyConstraint(['uploaded_by'], ['user.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    else:
        print("knowledge_file table already exists, checking uploaded_by column type...")
        # Check and update the uploaded_by column type if needed
        try:
            conn.execute(text("ALTER TABLE knowledge_file ALTER COLUMN uploaded_by TYPE INTEGER USING uploaded_by::INTEGER"))
            print("Updated uploaded_by column to INTEGER type")
        except Exception as e:
            print(f"Failed to alter uploaded_by column: {e}")
            print("Skipping this step...")


def downgrade() -> None:
    # Drop knowledge_file table
    op.drop_table('knowledge_file')
    
    # Check if dms_integration table exists
    conn = op.get_bind()
    result = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dms_integration')"))
    table_exists = result.scalar()
    
    if table_exists:
        try:
            # Try to remove timeout_seconds from dms_integration table
            op.drop_column('dms_integration', 'timeout_seconds')
        except Exception as e:
            print(f"Failed to drop timeout_seconds column: {e}")
            print("Skipping this step...")
    
    # Try to remove topic field from inquiry table
    try:
        op.drop_column('inquiry', 'topic')
    except Exception as e:
        print(f"Failed to drop topic column: {e}")
        print("Skipping this step...")
    
    # Remove service_center_description from organization table
    op.drop_column('organization', 'service_center_description') 