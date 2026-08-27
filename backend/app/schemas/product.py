from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)

    description: str | None = None

    category: str = Field(
        min_length=1,
        max_length=100,
    )

    price: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    currency: str = Field(
        default="INR",
        min_length=3,
        max_length=3,
    )

    stock: int = Field(
        default=0,
        ge=0,
    )

    active: bool = True


class ProductCreate(ProductBase):
    merchant_id: UUID


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = None

    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    price: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    currency: str | None = Field(
        default=None,
        min_length=3,
        max_length=3,
    )

    stock: int | None = Field(
        default=None,
        ge=0,
    )

    active: bool | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    merchant_id: UUID
    created_at: datetime
    updated_at: datetime