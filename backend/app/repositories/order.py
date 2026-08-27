from uuid import UUID
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate


class OrderRepository:

    @staticmethod
    def create(
        db: Session,
        order_data: OrderCreate,
    ) -> Order:

        # ----------------------------------------------------
        # 1. Find the product
        # ----------------------------------------------------

        product = db.scalar(
            select(Product).where(
                Product.id == order_data.product_id,
                Product.merchant_id == order_data.merchant_id,
            )
        )

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        # ----------------------------------------------------
        # 2. Check available stock
        # ----------------------------------------------------

        if product.stock < order_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock. "
                    f"Only {product.stock} units available."
                ),
            )

        # ----------------------------------------------------
        # 3. Reduce product stock
        # ----------------------------------------------------

        product.stock -= order_data.quantity

        # ----------------------------------------------------
        # 4. Create order
        # ----------------------------------------------------

        order_data_dict = order_data.model_dump()

        order_data_dict["created_at"] = (
            datetime.now(timezone.utc)
        )

        order = Order(
            **order_data_dict
        )

        db.add(order)

        # ----------------------------------------------------
        # 5. Save both changes together
        # ----------------------------------------------------

        try:
            db.commit()

        except Exception:
            db.rollback()
            raise

        # ----------------------------------------------------
        # 6. Refresh database objects
        # ----------------------------------------------------

        db.refresh(order)
        db.refresh(product)

        return order

    @staticmethod
    def get_all(
        db: Session,
        merchant_id: UUID | None = None,
    ) -> list[Order]:

        statement = select(Order)

        if merchant_id:
            statement = statement.where(
                Order.merchant_id == merchant_id
            )

        statement = statement.order_by(
            Order.created_at.desc()
        )

        return list(
            db.scalars(statement).all()
        )