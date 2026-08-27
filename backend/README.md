# RazorGrow AI Backend

Initial FastAPI service for RazorGrow AI.

## Run locally

From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Health check: `http://localhost:8000/api/v1/health`

The database, authentication, AI tools, and Razorpay integration are intentionally not implemented in this milestone.
