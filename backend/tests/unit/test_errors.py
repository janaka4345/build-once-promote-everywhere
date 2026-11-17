from app.errors import _field_from_loc, error_envelope


def test_error_envelope_structure():
    result = error_envelope(
        code="validation_error",
        message="Request validation failed",
        details=[{"field": "title", "message": "Field required"}],
    )
    assert result == {
        "error": {
            "code": "validation_error",
            "message": "Request validation failed",
            "details": [{"field": "title", "message": "Field required"}],
        }
    }


def test_field_from_loc_strips_http_location_prefixes():
    assert _field_from_loc(("body", "title")) == "title"
    assert _field_from_loc(("path", "task_id")) == "task_id"
    assert _field_from_loc(("body", "items", 0, "name")) == "name"

