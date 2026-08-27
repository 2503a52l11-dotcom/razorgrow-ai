from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analytics import AnalyticsService
from app.services.ai import AIService
from app.models.product import Product


router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
)


@router.get("/recommendations")
def get_ai_recommendations(
    merchant_id: UUID = Query(...),
    db: Session = Depends(get_db),
):
    # Get sales information
    sales_data = AnalyticsService.get_sales_summary(
        db,
        merchant_id,
    )

    # Get active product count
    products_count = db.execute(
        select(func.count(Product.id))
        .where(
            Product.merchant_id == merchant_id,
            Product.active == True,
        )
    ).scalar_one()

    # Get total inventory
    inventory = db.execute(
        select(
            func.coalesce(
                func.sum(Product.stock),
                0,
            )
        )
        .where(
            Product.merchant_id == merchant_id,
            Product.active == True,
        )
    ).scalar_one()

    # Generate local AI recommendation using Ollama + Qwen3
    recommendation = AIService.generate_business_recommendation(
        float(sales_data["total_revenue"]),
        int(sales_data["total_orders"]),
        int(products_count),
        int(inventory),
    )

    return {
        "merchant_id": merchant_id,
        "sales_data": sales_data,
        "products": products_count,
        "inventory": inventory,
        "recommendation": recommendation,
    }