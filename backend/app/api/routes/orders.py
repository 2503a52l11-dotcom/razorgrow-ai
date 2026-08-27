from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order import OrderService


router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    return OrderService.create_order(
        db,
        order_data,
    )


@router.get(
    "",
    response_model=list[OrderResponse],
)
def get_orders(
    merchant_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return OrderService.get_orders(
        db,
        merchant_id,
    )