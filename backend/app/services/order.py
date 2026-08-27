from uuid import UUID

from sqlalchemy.orm import Session

from app.models.order import Order
from app.repositories.order import OrderRepository
from app.schemas.order import OrderCreate


class OrderService:

    @staticmethod
    def create_order(
        db: Session,
        order_data: OrderCreate,
    ) -> Order:

        return OrderRepository.create(
            db,
            order_data,
        )

    @staticmethod
    def get_orders(
        db: Session,
        merchant_id: UUID | None = None,
    ) -> list[Order]:

        return OrderRepository.get_all(
            db,
            merchant_id,
        )