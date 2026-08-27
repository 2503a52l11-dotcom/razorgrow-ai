from uuid import UUID

from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:

    @staticmethod
    def create_product(
        db: Session,
        product_data: ProductCreate,
    ) -> Product:

        return ProductRepository.create(
            db,
            product_data,
        )

    @staticmethod
    def get_product(
        db: Session,
        product_id: UUID,
    ) -> Product | None:

        return ProductRepository.get_by_id(
            db,
            product_id,
        )

    @staticmethod
    def get_products(
        db: Session,
        merchant_id: UUID | None = None,
    ) -> list[Product]:

        return ProductRepository.get_all(
            db,
            merchant_id,
        )

    @staticmethod
    def update_product(
        db: Session,
        product: Product,
        product_data: ProductUpdate,
    ) -> Product:

        return ProductRepository.update(
            db,
            product,
            product_data,
        )

    @staticmethod
    def delete_product(
        db: Session,
        product: Product,
    ) -> None:

        ProductRepository.delete(
            db,
            product,
        )