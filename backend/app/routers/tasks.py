from uuid import UUID

from fastapi import APIRouter, HTTPException, Response

from app.deps import SessionDep
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import tasks as tasks_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", status_code=201, response_model=TaskRead)
def create_task(body: TaskCreate, db: SessionDep) -> TaskRead:
    return TaskRead.model_validate(tasks_service.create_task(db, body))


@router.get("", response_model=list[TaskRead])
def list_tasks(db: SessionDep) -> list[TaskRead]:
    return [
        TaskRead.model_validate(task) for task in tasks_service.list_tasks(db)
    ]


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: UUID, db: SessionDep) -> TaskRead:
    task = tasks_service.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskRead.model_validate(task)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: UUID, body: TaskUpdate, db: SessionDep) -> TaskRead:
    task = tasks_service.update_task(db, task_id, body)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskRead.model_validate(task)


@router.delete("/{task_id}", status_code=204, response_class=Response)
def delete_task(task_id: UUID, db: SessionDep) -> Response:
    deleted = tasks_service.delete_task(db, task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return Response(status_code=204)
