from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, data: TaskCreate) -> Task:
    task = Task(
        title=data.title,
        description=data.description,
        status=TaskStatus(data.status),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks(db: Session) -> list[Task]:
    stmt = select(Task).order_by(Task.created_at.desc())
    return list(db.scalars(stmt).all())


def get_task(db: Session, task_id: UUID) -> Task | None:
    return db.get(Task, task_id)


def update_task(db: Session, task_id: UUID, data: TaskUpdate) -> Task | None:
    task = get_task(db, task_id)
    if task is None:
        return None

    fields_set = data.model_fields_set
    if not fields_set:
        return task

    if "title" in fields_set:
        assert data.title is not None
        task.title = data.title
    if "description" in fields_set:
        task.description = data.description
    if "status" in fields_set:
        assert data.status is not None
        task.status = TaskStatus(data.status)

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: UUID) -> bool:
    task = get_task(db, task_id)
    if task is None:
        return False

    db.delete(task)
    db.commit()
    return True
