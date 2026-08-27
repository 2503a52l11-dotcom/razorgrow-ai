from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product


class InsightService:

    @staticmethod
    def generate_insights(
        db: Session,
        merchant_id: UUID,
    ):

        revenue, units, orders = db.execute(
            select(
                func.coalesce(func.sum(Order.total_amount), 0),
                func.coalesce(func.sum(Order.quantity), 0),
                func.count(Order.id),
            )
            .where(
                Order.merchant_id == merchant_id,
                Order.status == "completed",
            )
        ).one()

        revenue = Decimal(revenue)
        units = int(units)
        orders = int(orders)

        insights = []

        if orders == 0:
            insights.append(
                {
                    "type": "warning",
                    "title": "No sales yet",
                    "message": (
                        "There are no completed orders for this merchant."
                    ),
                }
            )

        else:
            average_order_value = revenue / orders

            insights.append(
                {
                    "type": "summary",
                    "title": "Sales performance",
                    "message": (
                        f"{orders} completed orders generated "
                        f"₹{revenue:.2f} in revenue "
                        f"across {units} units."
                    ),
                }
            )

            if average_order_value < Decimal("1000"):
                insights.append(
                    {
                        "type": "recommendation",
                        "title": "Increase order value",
                        "message": (
                            "Average order value is below ₹1,000. "
                            "Consider bundles, upselling, or "
                            "cross-selling complementary products."
                        ),
                    }
                )

            else:
                insights.append(
                    {
                        "type": "positive",
                        "title": "Healthy order value",
                        "message": (
                            f"Average order value is "
                            f"₹{average_order_value:.2f}."
                        ),
                    }
                )

        low_stock_count = db.scalar(
            select(func.count(Product.id))
            .where(
                Product.merchant_id == merchant_id,
                Product.active.is_(True),
                Product.stock <= 10,
            )
        )

        if low_stock_count and low_stock_count > 0:
            insights.append(
                {
                    "type": "warning",
                    "title": "Low stock detected",
                    "message": (
                        f"{low_stock_count} active product(s) "
                        "have stock at or below 10 units."
                    ),
                }
            )

        return {
            "merchant_id": merchant_id,
            "insights": insights,
        }