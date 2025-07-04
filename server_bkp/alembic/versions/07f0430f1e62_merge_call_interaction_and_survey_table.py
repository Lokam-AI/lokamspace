"""merge_call_interaction_and_survey_table

Revision ID: 07f0430f1e62
Revises: 6a253fa9a632
Create Date: 2025-06-08 17:21:02.534417

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '07f0430f1e62'
down_revision: Union[str, None] = '6a253fa9a632'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add survey fields to call_interactions table
    op.add_column('call_interactions', sa.Column('overall_feedback', sa.Text(), nullable=True))
    op.add_column('call_interactions', sa.Column('overall_score', sa.Float(), nullable=True))
    op.add_column('call_interactions', sa.Column('timeliness_score', sa.Float(), nullable=True))
    op.add_column('call_interactions', sa.Column('cleanliness_score', sa.Float(), nullable=True))
    op.add_column('call_interactions', sa.Column('advisor_helpfulness_score', sa.Float(), nullable=True))
    op.add_column('call_interactions', sa.Column('work_quality_score', sa.Float(), nullable=True))
    op.add_column('call_interactions', sa.Column('recommendation_score', sa.Float(), nullable=True))
    op.add_column('call_interactions', sa.Column('action_items', sa.Text(), nullable=True))
    op.add_column('call_interactions', sa.Column('completed_at', sa.DateTime(), nullable=True))

    # Copy data from surveys to call_interactions
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
    op.drop_constraint('survey_responses_survey_id_fkey', 'survey_responses', type_='foreignkey')
    op.alter_column('survey_responses', 'survey_id', new_column_name='call_interaction_id')
    op.create_foreign_key('survey_responses_call_interaction_id_fkey', 'survey_responses', 'call_interactions', ['call_interaction_id'], ['id'])

    # Drop the surveys table
    op.drop_table('surveys')


def downgrade() -> None:
    # Recreate surveys table
    op.create_table('surveys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('call_interaction_id', sa.Integer(), nullable=False),
        sa.Column('overall_feedback', sa.Text(), nullable=True),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('timeliness_score', sa.Float(), nullable=True),
        sa.Column('cleanliness_score', sa.Float(), nullable=True),
        sa.Column('advisor_helpfulness_score', sa.Float(), nullable=True),
        sa.Column('work_quality_score', sa.Float(), nullable=True),
        sa.Column('recommendation_score', sa.Float(), nullable=True),
        sa.Column('action_items', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['call_interaction_id'], ['call_interactions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Move data back to surveys table
    op.execute("""
        INSERT INTO surveys (
            call_interaction_id, overall_feedback, overall_score,
            timeliness_score, cleanliness_score, advisor_helpfulness_score,
            work_quality_score, recommendation_score, action_items, completed_at
        )
        SELECT 
            id, overall_feedback, overall_score,
            timeliness_score, cleanliness_score, advisor_helpfulness_score,
            work_quality_score, recommendation_score, action_items, completed_at
        FROM call_interactions
        WHERE overall_score IS NOT NULL
    """)

    # Update survey_responses table to reference surveys
    op.drop_constraint('survey_responses_call_interaction_id_fkey', 'survey_responses', type_='foreignkey')
    op.alter_column('survey_responses', 'call_interaction_id', new_column_name='survey_id')
    op.create_foreign_key('survey_responses_survey_id_fkey', 'survey_responses', 'surveys', ['survey_id'], ['id'])

    # Remove survey fields from call_interactions
    op.drop_column('call_interactions', 'overall_feedback')
    op.drop_column('call_interactions', 'overall_score')
    op.drop_column('call_interactions', 'timeliness_score')
    op.drop_column('call_interactions', 'cleanliness_score')
    op.drop_column('call_interactions', 'advisor_helpfulness_score')
    op.drop_column('call_interactions', 'work_quality_score')
    op.drop_column('call_interactions', 'recommendation_score')
    op.drop_column('call_interactions', 'action_items')
    op.drop_column('call_interactions', 'completed_at')
