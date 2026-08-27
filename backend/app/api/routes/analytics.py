from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics import AnalyticsService


router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)


@router.get("/sales")
def get_sales_analytics(
    merchant_id: UUID = Query(...),
    db: Session = Depends(get_db),
):
    return AnalyticsService.get_sales_summary(
        db,
        merchant_id,
    )


@router.get("/daily-revenue")
def get_daily_revenue(
    merchant_id: UUID = Query(...),
    db: Session = Depends(get_db),
):
    return AnalyticsService.get_daily_revenue(
        db,
        merchant_id,
    )