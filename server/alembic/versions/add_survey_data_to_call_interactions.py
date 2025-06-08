"""add_survey_data_to_call_interactions

Revision ID: 8a7b3c9d2e1f
Revises: 07f0430f1e62
Create Date: 2024-03-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a7b3c9d2e1f'
down_revision: Union[str, None] = '07f0430f1e62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add survey fields to call_interactions table if they don't exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('call_interactions')]
    
    if 'overall_feedback' not in columns:
        op.add_column('call_interactions', sa.Column('overall_feedback', sa.Text(), nullable=True))
    if 'overall_score' not in columns:
        op.add_column('call_interactions', sa.Column('overall_score', sa.Float(), nullable=True))
    if 'timeliness_score' not in columns:
        op.add_column('call_interactions', sa.Column('timeliness_score', sa.Float(), nullable=True))
    if 'cleanliness_score' not in columns:
        op.add_column('call_interactions', sa.Column('cleanliness_score', sa.Float(), nullable=True))
    if 'advisor_helpfulness_score' not in columns:
        op.add_column('call_interactions', sa.Column('advisor_helpfulness_score', sa.Float(), nullable=True))
    if 'work_quality_score' not in columns:
        op.add_column('call_interactions', sa.Column('work_quality_score', sa.Float(), nullable=True))
    if 'recommendation_score' not in columns:
        op.add_column('call_interactions', sa.Column('recommendation_score', sa.Float(), nullable=True))
    if 'action_items' not in columns:
        op.add_column('call_interactions', sa.Column('action_items', sa.Text(), nullable=True))
    if 'completed_at' not in columns:
        op.add_column('call_interactions', sa.Column('completed_at', sa.DateTime(), nullable=True))

    # Check if surveys table exists and copy data if it does
    if 'surveys' in inspector.get_table_names():
        op.execute("""
            UPDATE call_interactions ci
            SET 
                overall_feedback = s.overall_feedback,
                overall_score = s.overall_score,
                timeliness_score = s.timeliness_score,
                cleanliness_score = s.cleanliness_score,
                advisor_helpfulness_score = s.advisor_helpfulness_score,
                work_quality_score = s.work_quality_score,
                recommendation_score = s.recommendation_score,
                action_items = s.action_items,
                completed_at = s.completed_at
            FROM surveys s
            WHERE ci.id = s.call_interaction_id
        """)

    # Update survey_responses table to reference call_interactions
    if 'survey_responses' in inspector.get_table_names():
        # Check if the foreign key exists before trying to drop it
        fks = inspector.get_foreign_keys('survey_responses')
        survey_fk = next((fk for fk in fks if fk['referred_table'] == 'surveys'), None)
        if survey_fk:
            op.drop_constraint(survey_fk['name'], 'survey_responses', type_='foreignkey')
        
        # Check if the column exists before trying to rename it
        if 'survey_id' in [col['name'] for col in inspector.get_columns('survey_responses')]:
            op.alter_column('survey_responses', 'survey_id', new_column_name='call_interaction_id')
        
        # Create new foreign key if it doesn't exist
        call_interaction_fk = next((fk for fk in fks if fk['referred_table'] == 'call_interactions'), None)
        if not call_interaction_fk:
            op.create_foreign_key(
                'survey_responses_call_interaction_id_fkey',
                'survey_responses',
                'call_interactions',
                ['call_interaction_id'],
                ['id']
            )


def downgrade() -> None:
    # This is a data migration, so downgrade is a no-op
    pass 