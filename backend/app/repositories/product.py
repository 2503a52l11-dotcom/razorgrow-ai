from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:

    @staticmethod
    def create(
        db: Session,
        product_data: ProductCreate,
    ) -> Product:
        product = Product(
            **product_data.model_dump()
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        return product

    @staticmethod
    def get_by_id(
        db: Session,
        product_id: UUID,
    ) -> Product | None:
        statement = select(Product).where(
            Product.id == product_id
        )

        return db.scalar(statement)

    @staticmethod
    def get_all(
        db: Session,
        merchant_id: UUID | None = None,
    ) -> list[Product]:

        statement = select(Product)

        if merchant_id:
            statement = statement.where(
                Product.merchant_id == merchant_id
            )

        statement = statement.order_by(
            Product.created_at.desc()
        )

        return list(db.scalars(statement).all())

    @staticmethod
    def update(
        db: Session,
        product: Product,
        product_data: ProductUpdate,
    ) -> Product:

        updates = product_data.model_dump(
            exclude_unset=True
        )

        for field, value in updates.items():
            setattr(product, field, value)

        db.commit()
        db.refresh(product)

        return product

    @staticmethod
    def delete(
        db: Session,
        product: Product,
    ) -> None:

        db.delete(product)
        db.commit()