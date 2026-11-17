from fastapi.testclient import TestClient

from app.main import app


def test_healthz_is_ok():
    assert TestClient(app).get("/healthz").status_code == 200


def test_readyz_is_unavailable_before_startup():
    assert TestClient(app).get("/readyz").status_code == 503


def test_readyz_is_ok_after_startup(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    with TestClient(app) as client:
        assert client.get("/readyz").status_code == 200
