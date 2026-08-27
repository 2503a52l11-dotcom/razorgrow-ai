from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class OrderCreate(BaseModel):
    merchant_id: UUID
    product_id: UUID

    quantity: int = Field(
        gt=0,
        le=10000,
    )

    total_amount: Decimal = Field(
        gt=0,
        decimal_places=2,
    )

    status: str = Field(
        default="completed",
        max_length=30,
    )


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    merchant_id: UUID
    product_id: UUID
    quantity: int
    total_amount: Decimal
    status: str
    created_at: datetime