from datetime import datetime, timezone
from uuid import uuid4

import pytest
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from pydantic import ValidationError


def test_task_create_trims_title_and_normalizes_blank_description():
    payload = TaskCreate(title="  Buy milk  ", description="   ")
    assert payload.title == "Buy milk"
    assert payload.description is None
    assert payload.status == "todo"


def test_task_create_rejects_empty_title_after_trim():
    with pytest.raises(ValidationError):
        TaskCreate(title="   ")


def test_task_create_rejects_extra_fields():
    with pytest.raises(ValidationError):
        TaskCreate(title="Valid", unknown="nope")  # type: ignore[call-arg]


def test_task_update_rejects_null_title_and_status():
    with pytest.raises(ValidationError, match="Title cannot be null"):
        TaskUpdate(title=None)
    with pytest.raises(ValidationError, match="Task Status cannot be null"):
        TaskUpdate(status=None)


def test_task_update_normalizes_blank_description_to_none():
    payload = TaskUpdate(description="   ")
    assert "description" in payload.model_fields_set
    assert payload.description is None


def test_task_read_serializes_timestamps_as_utc_z():
    now = datetime(2026, 11, 12, 14, 30, 0, tzinfo=timezone.utc)
    task = TaskRead(
        id=uuid4(),
        title="Ship tests",
        description=None,
        status="doing",
        created_at=now,
        updated_at=now,
    )
    dumped = task.model_dump()
    assert dumped["created_at"] == "2026-11-12T14:30:00Z"
    assert dumped["updated_at"] == "2026-11-12T14:30:00Z"

