from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.errors import register_exception_handlers
from app.routers.tasks import router as tasks_router

# Fail fast at import if DATABASE_URL is missing or empty.
get_settings()

# Local TanStack Start / Vite default from frontend/package.json (`vite dev --port 3000`).
LOCAL_FRONTEND_ORIGIN = "http://localhost:3000"

app = FastAPI(title="Task Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[LOCAL_FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(tasks_router)
