from datetime import datetime, timezone
from typing import Annotated, Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    StringConstraints,
    field_serializer,
    field_validator,
)

TaskStatusLiteral = Literal["todo", "doing", "done"]

TitleStr = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=200),
]


def _normalize_description(value: object) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return value  # type: ignore[return-value]
    trimmed = value.strip()
    if not trimmed:
        return None
    if len(trimmed) > 5000:
        raise ValueError("Description must be at most 5000 characters after trim")
    return trimmed


def _serialize_utc_z(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)
    return value.isoformat().replace("+00:00", "Z")


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: TitleStr
    description: str | None = None
    status: TaskStatusLiteral = "todo"

    @field_validator("description", mode="before")
    @classmethod
    def normalize_description(cls, value: object) -> str | None:
        return _normalize_description(value)


class TaskUpdate(BaseModel):
    """Partial update: omit = unchanged; description null/blank clears to null."""

    model_config = ConfigDict(extra="forbid")

    title: TitleStr | None = None
    description: str | None = None
    status: TaskStatusLiteral | None = None

    @field_validator("title", mode="before")
    @classmethod
    def reject_null_title(cls, value: object) -> object:
        if value is None:
            raise ValueError("Title cannot be null")
        return value

    @field_validator("status", mode="before")
    @classmethod
    def reject_null_status(cls, value: object) -> object:
        if value is None:
            raise ValueError("Task Status cannot be null")
        return value

    @field_validator("description", mode="before")
    @classmethod
    def normalize_description(cls, value: object) -> str | None:
        return _normalize_description(value)


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None
    status: TaskStatusLiteral
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at")
    def serialize_timestamps(self, value: datetime) -> str:
        return _serialize_utc_z(value)
