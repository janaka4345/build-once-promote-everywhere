import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db import engine
from app.main import app


def _postgres_is_reachable() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError:
        return False


@pytest.mark.skipif(
    not _postgres_is_reachable(),
    reason="PostgreSQL database is not reachable for E2E test",
)
def test_task_full_lifecycle_against_real_postgres(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "e2e")
    created_id: str | None = None

    with TestClient(app) as client:
        try:
            create_res = client.post(
                "/api/tasks",
                json={
                    "title": "E2E Lifecycle Task",
                    "description": "Persisted in PostgreSQL",
                    "status": "todo",
                },
            )
            assert create_res.status_code == 201
            created = create_res.json()
            created_id = created["id"]

            list_res = client.get("/api/tasks")
            assert list_res.status_code == 200
            assert any(t["id"] == created_id for t in list_res.json())

            patch_res = client.patch(
                f"/api/tasks/{created_id}",
                json={"status": "done"},
            )
            assert patch_res.status_code == 200
            assert patch_res.json()["status"] == "done"

            delete_res = client.delete(f"/api/tasks/{created_id}")
            assert delete_res.status_code == 204
            created_id = None

            after_delete = client.get(f"/api/tasks/{created['id']}")
            assert after_delete.status_code == 404
        finally:
            if created_id is not None:
                client.delete(f"/api/tasks/{created_id}")

