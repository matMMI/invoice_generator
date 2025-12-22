from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime, timezone


class Client(SQLModel, table=True):
    """Client/customer entity for quote recipients."""
    
    __tablename__ = "client"  # type: ignore
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    name: str = Field(max_length=255)
    email: str = Field(max_length=255)
    company: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None)
    phone: str | None = Field(default=None, max_length=50)
    vat_number: str | None = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


