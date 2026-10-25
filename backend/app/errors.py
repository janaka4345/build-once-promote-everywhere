from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def error_envelope(
    *,
    code: str,
    message: str,
    details: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "details": details}}


def _field_from_loc(loc: tuple[Any, ...]) -> str:
    """Return a flat field name (last non-meta path segment)."""
    skip = {"body", "query", "path", "header", "cookie"}
    parts = [str(part) for part in loc if part not in skip and not isinstance(part, int)]
    return parts[-1] if parts else ".".join(str(part) for part in loc)


async def request_validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = [
        {"field": _field_from_loc(tuple(error["loc"])), "message": error["msg"]}
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=error_envelope(
            code="validation_error",
            message="Request validation failed",
            details=details,
        ),
    )


async def http_exception_handler(
    _request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    if exc.status_code == 404:
        message = exc.detail if isinstance(exc.detail, str) else "Not found"
        return JSONResponse(
            status_code=404,
            content=error_envelope(code="not_found", message=message, details=None),
        )
    if exc.status_code == 422:
        message = (
            exc.detail if isinstance(exc.detail, str) else "Request validation failed"
        )
        return JSONResponse(
            status_code=422,
            content=error_envelope(
                code="validation_error",
                message=message,
                details=None,
            ),
        )
    if exc.status_code >= 500:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_envelope(
                code="internal_error",
                message="Internal server error",
                details=None,
            ),
        )

    # Other 4xx: keep status; only the three settled codes exist — client errors share validation_error.
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content=error_envelope(
            code="validation_error",
            message=message,
            details=None,
        ),
    )


async def unhandled_exception_handler(
    _request: Request,
    _exc: Exception,
) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_envelope(
            code="internal_error",
            message="Internal server error",
            details=None,
        ),
    )


def register_exception_handlers(app: Any) -> None:
    app.add_exception_handler(
        RequestValidationError,
        request_validation_exception_handler,
    )
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
