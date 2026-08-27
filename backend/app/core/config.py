import os
from pathlib import Path

from dotenv import load_dotenv


# backend/.env
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

load_dotenv(ENV_FILE)


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Please add it to backend/.env"
    )