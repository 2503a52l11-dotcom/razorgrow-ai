from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.merchants import router as merchants_router
from app.api.routes.products import router as products_router
from app.api.routes.orders import router as orders_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.insights import router as insights_router


app = FastAPI(
    title="RazorGrow AI API",
    description="Backend API for the RazorGrow AI prototype.",
    version="0.1.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTES
# =========================================================

# IMPORTANT:
# Do NOT add prefix="/api/v1" here.
# The individual route files already contain /api/v1.

app.include_router(health_router)

app.include_router(merchants_router)

app.include_router(products_router)

app.include_router(orders_router)

app.include_router(analytics_router)

app.include_router(insights_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "service": "razorgrow-ai-api",
        "status": "running",
        "docs": "/docs",
    }