import httpx
from fastapi.testclient import TestClient

from app import main

client = TestClient(main.app)


def test_product_is_fetched_from_upstream(monkeypatch):
    def fake_get(url, timeout):
        assert url == "https://dummyjson.com/products/1"
        return httpx.Response(
            200, json={"id": 1, "title": "Phone"}, request=httpx.Request("GET", url)
        )

    monkeypatch.setattr(main.httpx, "get", fake_get)

    response = client.get("/api/products/1")

    assert response.status_code == 200
    assert response.json() == {"id": 1, "title": "Phone"}


def test_upstream_failure_becomes_502(monkeypatch):
    def fake_get(url, timeout):
        raise httpx.ConnectError("upstream down")

    monkeypatch.setattr(main.httpx, "get", fake_get)

    assert client.get("/api/products/1").status_code == 502


def test_upstream_404_becomes_502(monkeypatch):
    def fake_get(url, timeout):
        return httpx.Response(404, request=httpx.Request("GET", url))

    monkeypatch.setattr(main.httpx, "get", fake_get)

    assert client.get("/api/products/1").status_code == 502
