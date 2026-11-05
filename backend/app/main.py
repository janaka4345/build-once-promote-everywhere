import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.errors import register_exception_handlers
from app.routers.tasks import router as tasks_router

# Fail fast at import if DATABASE_URL is missing or empty.
get_settings()


def read_app_env() -> str:
    app_env = os.environ.get("APP_ENV", "").strip()
    if not app_env:
        raise RuntimeError("APP_ENV must be set, for example APP_ENV=development")
    return app_env


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.app_env = read_app_env()
    yield


# Local TanStack Start / Vite default from frontend/package.json (`vite dev --port 3000`).
LOCAL_FRONTEND_ORIGIN = "http://localhost:3000"

app = FastAPI(title="Task Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[LOCAL_FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(tasks_router, prefix="/api")
app.include_router(tasks_router)


@app.get("/api/env")
def get_env():
    return {"app_env": app.state.app_env}

