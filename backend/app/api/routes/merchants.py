from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.merchant import (
    MerchantCreate,
    MerchantResponse,
    MerchantUpdate,
)
from app.services.merchant import MerchantService


router = APIRouter(
    prefix="/api/v1/merchants",
    tags=["Merchants"],
)


@router.post(
    "",
    response_model=MerchantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_merchant(
    merchant_data: MerchantCreate,
    db: Session = Depends(get_db),
):
    return MerchantService.create_merchant(
        db,
        merchant_data,
    )


@router.get(
    "",
    response_model=list[MerchantResponse],
)
def get_merchants(
    db: Session = Depends(get_db),
):
    return MerchantService.get_merchants(db)


@router.get(
    "/{merchant_id}",
    response_model=MerchantResponse,
)
def get_merchant(
    merchant_id: UUID,
    db: Session = Depends(get_db),
):
    merchant = MerchantService.get_merchant(
        db,
        merchant_id,
    )

    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found",
        )

    return merchant


@router.patch(
    "/{merchant_id}",
    response_model=MerchantResponse,
)
def update_merchant(
    merchant_id: UUID,
    merchant_data: MerchantUpdate,
    db: Session = Depends(get_db),
):
    merchant = MerchantService.get_merchant(
        db,
        merchant_id,
    )

    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found",
        )

    return MerchantService.update_merchant(
        db,
        merchant,
        merchant_data,
    )