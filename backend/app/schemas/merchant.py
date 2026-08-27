from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MerchantCreate(BaseModel):
    business_name: str = Field(
        min_length=1,
        max_length=255,
    )

    email: str = Field(
        min_length=3,
        max_length=255,
    )


class MerchantUpdate(BaseModel):
    business_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    email: str | None = Field(
        default=None,
        min_length=3,
        max_length=255,
    )

    is_active: bool | None = None


class MerchantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_name: str
    email: str
    is_active: bool
    created_at: datetime
    updated_at: datetime