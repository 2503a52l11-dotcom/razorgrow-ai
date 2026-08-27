from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from app.services.product import ProductService


router = APIRouter(
    prefix="/api/v1/products",
    tags=["Products"],
)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    return ProductService.create_product(
        db,
        product_data,
    )


@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_products(
    merchant_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return ProductService.get_products(
        db,
        merchant_id,
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    product = ProductService.get_product(
        db,
        product_id,
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
):
    product = ProductService.get_product(
        db,
        product_id,
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return ProductService.update_product(
        db,
        product,
        product_data,
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
):
    product = ProductService.get_product(
        db,
        product_id,
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    ProductService.delete_product(
        db,
        product,
    )

    return None