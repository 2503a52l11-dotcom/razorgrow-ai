from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order


class AnalyticsService:

    @staticmethod
    def get_sales_summary(
        db: Session,
        merchant_id: UUID,
    ):

        result = db.execute(
            select(
                func.count(Order.id),
                func.coalesce(
                    func.sum(Order.total_amount),
                    0,
                ),
                func.coalesce(
                    func.sum(Order.quantity),
                    0,
                ),
            )
            .where(
                Order.merchant_id == merchant_id,
                Order.status == "completed",
            )
        ).one()

        total_orders = result[0]
        total_revenue = Decimal(result[1])
        units_sold = result[2]

        average_order_value = (
            total_revenue / total_orders
            if total_orders > 0
            else Decimal("0")
        )

        return {
            "merchant_id": merchant_id,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "units_sold": units_sold,
            "average_order_value": average_order_value,
        }

    # ========================================================
    # DAILY REVENUE
    # ========================================================

    @staticmethod
    def get_daily_revenue(
        db: Session,
        merchant_id: UUID,
    ):

        statement = (
            select(
                func.date(Order.created_at).label("date"),
                func.coalesce(
                    func.sum(Order.total_amount),
                    0,
                ).label("revenue"),
                func.count(Order.id).label("orders"),
            )
            .where(
                Order.merchant_id == merchant_id,
                Order.status == "completed",
            )
            .group_by(
                func.date(Order.created_at)
            )
            .order_by(
                func.date(Order.created_at)
            )
        )

        results = db.execute(statement).all()

        return [
            {
                "date": str(row.date),
                "revenue": float(row.revenue),
                "orders": int(row.orders),
            }
            for row in results
        ]