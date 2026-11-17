from uuid import uuid4

from fastapi.testclient import TestClient


def test_create_and_get_task(client: TestClient):
    create_res = client.post(
        "/api/tasks",
        json={"title": "  Write integration tests  ", "description": "  Cover CRUD  "},
    )
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["title"] == "Write integration tests"
    assert created["description"] == "Cover CRUD"
    assert created["status"] == "todo"

    get_res = client.get(f"/api/tasks/{created['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == created["id"]


def test_list_tasks_returns_created_items(client: TestClient):
    client.post("/api/tasks", json={"title": "First task"})
    client.post("/api/tasks", json={"title": "Second task", "status": "doing"})

    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    titles = {task["title"] for task in list_res.json()}
    assert titles == {"First task", "Second task"}


def test_update_and_delete_task(client: TestClient):
    created = client.post(
        "/api/tasks",
        json={"title": "Initial", "description": "Details", "status": "todo"},
    ).json()
    task_id = created["id"]

    patch_res = client.patch(
        f"/api/tasks/{task_id}",
        json={"status": "done", "description": "   "},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["title"] == "Initial"
    assert updated["status"] == "done"
    assert updated["description"] is None

    delete_res = client.delete(f"/api/tasks/{task_id}")
    assert delete_res.status_code == 204

    missing_res = client.get(f"/api/tasks/{task_id}")
    assert missing_res.status_code == 404
    assert missing_res.json()["error"]["code"] == "not_found"


def test_validation_error_returns_standard_envelope(client: TestClient):
    res = client.post("/api/tasks", json={"title": "   "})
    assert res.status_code == 422
    body = res.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["details"][0]["field"] == "title"


def test_get_missing_task_returns_404_envelope(client: TestClient):
    res = client.get(f"/api/tasks/{uuid4()}")
    assert res.status_code == 404
    assert res.json() == {
        "error": {
            "code": "not_found",
            "message": "Task not found",
            "details": None,
        }
    }

