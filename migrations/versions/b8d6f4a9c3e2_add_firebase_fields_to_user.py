"""Add firebase_uid and photo_url to user table

Revision ID: b8d6f4a9c3e2
Revises: 353b392a00fe
Create Date: 2025-12-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b8d6f4a9c3e2'
down_revision = '353b392a00fe'
branch_labels = None
depends_on = None


def upgrade():
    # Add firebase_uid column (nullable for existing users) and unique constraint
    op.add_column('user', sa.Column('firebase_uid', sa.String(length=255), nullable=True))
    # Add photo_url column for user profile pictures
    op.add_column('user', sa.Column('photo_url', sa.String(length=1024), nullable=True))
    # Create a unique constraint on firebase_uid to prevent duplicates
    try:
        op.create_unique_constraint('uq_user_firebase_uid', 'user', ['firebase_uid'])
    except Exception:
        # Some DB backends may throw if duplicate values exist; leave to DB admin to resolve
        pass


def downgrade():
    # Drop the unique constraint if it exists, then drop the columns
    try:
        op.drop_constraint('uq_user_firebase_uid', 'user', type_='unique')
    except Exception:
        pass
    op.drop_column('user', 'photo_url')
    op.drop_column('user', 'firebase_uid')
