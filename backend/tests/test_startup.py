import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_startup_fails_without_app_env(monkeypatch):
    monkeypatch.delenv("APP_ENV", raising=False)

    with pytest.raises(RuntimeError, match="APP_ENV"):
        with TestClient(app):
            pass


def test_startup_succeeds_with_app_env(monkeypatch):
    monkeypatch.setenv("APP_ENV", "staging")

    with TestClient(app) as client:
        response = client.get("/api/env")
        assert response.status_code == 200
        assert response.json() == {"app_env": "staging"}

