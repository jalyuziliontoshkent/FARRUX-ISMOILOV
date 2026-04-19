"""Initial schema from existing tables

Revision ID: 001
Revises: 
Create Date: 2026-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False, server_default=""),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.Text(), nullable=False, server_default="dealer"),
        sa.Column("phone", sa.Text(), nullable=False, server_default=""),
        sa.Column("address", sa.Text(), nullable=False, server_default=""),
        sa.Column("credit_limit", sa.Float(), nullable=False, server_default="0"),
        sa.Column("debt", sa.Float(), nullable=False, server_default="0"),
        sa.Column("specialty", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.Text(), nullable=False, server_default=""),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email")
    )
    
    # Categories table
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("image_url", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.Text(), nullable=False, server_default=""),
        sa.PrimaryKeyConstraint("id")
    )
    
    # Materials table
    op.create_table(
        "materials",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("category", sa.Text(), nullable=False, server_default=""),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("price_per_sqm", sa.Float(), nullable=False, server_default="0"),
        sa.Column("stock_quantity", sa.Float(), nullable=False, server_default="0"),
        sa.Column("unit", sa.Text(), nullable=False, server_default="kv.m"),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("image_url", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.Text(), nullable=False, server_default=""),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="SET NULL")
    )
    
    # Orders table
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_code", sa.Text(), nullable=False, server_default=""),
        sa.Column("dealer_id", sa.Integer(), nullable=True),
        sa.Column("dealer_name", sa.Text(), nullable=False, server_default=""),
        sa.Column("items", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("total_sqm", sa.Float(), nullable=False, server_default="0"),
        sa.Column("total_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("status", sa.Text(), nullable=False, server_default="kutilmoqda"),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("rejection_reason", sa.Text(), nullable=False, server_default=""),
        sa.Column("delivery_info", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Text(), nullable=False, server_default=""),
        sa.Column("updated_at", sa.Text(), nullable=False, server_default=""),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["dealer_id"], ["users.id"])
    )
    
    # Messages table
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=True),
        sa.Column("sender_name", sa.Text(), nullable=False, server_default=""),
        sa.Column("sender_role", sa.Text(), nullable=False, server_default=""),
        sa.Column("receiver_id", sa.Integer(), nullable=True),
        sa.Column("text", sa.Text(), nullable=False, server_default=""),
        sa.Column("read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.Text(), nullable=False, server_default=""),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["receiver_id"], ["users.id"])
    )
    
    # Payments table
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("dealer_id", sa.Integer(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.Text(), nullable=False, server_default=""),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["dealer_id"], ["users.id"])
    )
    
    # Indexes for performance
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role", "users", ["role"])
    op.create_index("ix_orders_dealer_id", "orders", ["dealer_id"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_messages_sender_receiver", "messages", ["sender_id", "receiver_id"])
    op.create_index("ix_materials_category_id", "materials", ["category_id"])


def downgrade() -> None:
    op.drop_table("payments")
    op.drop_table("messages")
    op.drop_table("orders")
    op.drop_table("materials")
    op.drop_table("categories")
    op.drop_table("users")
