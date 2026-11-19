import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.errors import register_exception_handlers
from app.routers.tasks import router as tasks_router

# Fail fast at import if DATABASE_URL is missing or empty.
get_settings()

PRODUCTS_API_URL = os.getenv("PRODUCTS_API_URL", "https://dummyjson.com")


def read_app_env() -> str:
    app_env = Settings().APP_ENV.strip()
    if not app_env:
        raise RuntimeError("APP_ENV must be set, for example APP_ENV=development")
    return app_env


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.app_env = read_app_env()
    app.state.ready = True
    try:
        yield
    finally:
        app.state.ready = False


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


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/readyz")
def readyz(response: Response):
    if not getattr(app.state, "ready", False):
        response.status_code = 503
        return {"status": "starting"}
    return {"status": "ready"}


@app.get("/api/env")
def get_env():
    return {
        "app_env": app.state.app_env,
        "message": os.getenv("APP_MESSAGE", ""),
    }


@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    try:
        response = httpx.get(f"{PRODUCTS_API_URL}/products/{product_id}", timeout=5.0)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502, detail="Product service unavailable"
        ) from exc
    return response.json()

