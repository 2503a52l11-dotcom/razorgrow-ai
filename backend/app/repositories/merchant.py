from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.merchant import Merchant
from app.schemas.merchant import MerchantCreate, MerchantUpdate


class MerchantRepository:

    @staticmethod
    def create(
        db: Session,
        merchant_data: MerchantCreate,
    ) -> Merchant:

        merchant = Merchant(
            **merchant_data.model_dump()
        )

        db.add(merchant)
        db.commit()
        db.refresh(merchant)

        return merchant

    @staticmethod
    def get_by_id(
        db: Session,
        merchant_id: UUID,
    ) -> Merchant | None:

        statement = select(Merchant).where(
            Merchant.id == merchant_id
        )

        return db.scalar(statement)

    @staticmethod
    def get_all(
        db: Session,
    ) -> list[Merchant]:

        statement = select(Merchant).order_by(
            Merchant.created_at.desc()
        )

        return list(db.scalars(statement).all())

    @staticmethod
    def update(
        db: Session,
        merchant: Merchant,
        merchant_data: MerchantUpdate,
    ) -> Merchant:

        updates = merchant_data.model_dump(
            exclude_unset=True
        )

        for field, value in updates.items():
            setattr(merchant, field, value)

        db.commit()
        db.refresh(merchant)

        return merchant