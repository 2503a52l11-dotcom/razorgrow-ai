from uuid import UUID

from sqlalchemy.orm import Session

from app.models.merchant import Merchant
from app.repositories.merchant import MerchantRepository
from app.schemas.merchant import MerchantCreate, MerchantUpdate


class MerchantService:

    @staticmethod
    def create_merchant(
        db: Session,
        merchant_data: MerchantCreate,
    ) -> Merchant:

        return MerchantRepository.create(
            db,
            merchant_data,
        )

    @staticmethod
    def get_merchant(
        db: Session,
        merchant_id: UUID,
    ) -> Merchant | None:

        return MerchantRepository.get_by_id(
            db,
            merchant_id,
        )

    @staticmethod
    def get_merchants(
        db: Session,
    ) -> list[Merchant]:

        return MerchantRepository.get_all(db)

    @staticmethod
    def update_merchant(
        db: Session,
        merchant: Merchant,
        merchant_data: MerchantUpdate,
    ) -> Merchant:

        return MerchantRepository.update(
            db,
            merchant,
            merchant_data,
        )