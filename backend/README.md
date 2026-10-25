# Task Tracker API (FastAPI)

Host-run backend for the Task Tracker learning app. Talks to Postgres published by the
repo's database compose file. Exposes full Task CRUD under `/tasks` (`POST`, `GET` list,
`GET` by id, `PATCH`, `DELETE`).

Canonical architecture/spec (including the local runbook summary):
[`docs/task-tracker-spec.md`](../docs/task-tracker-spec.md). Frontend start steps:
[`frontend/README.md`](../frontend/README.md).

## Local runbook

### 1. Start Postgres

From the repo `database/` directory (with `.env.local` copied from `.env.sample` if needed):

```bash
docker compose -f docker-compose-pgvector-latest.yml --env-file .env.local up -d postgres
```

### 2. Configure `DATABASE_URL`

```bash
cp .env.example .env
```

Edit `backend/.env` so the URL matches compose credentials and published port (`localhost`,
psycopg 3 dialect). Example:

```text
DATABASE_URL=postgresql+psycopg://admin:template_db_dev_password@localhost:5432/template_db
```

On some Windows setups `localhost` resolves to IPv6 (`::1`) while Docker publishes
Postgres on IPv4 only — if connections hang, use `127.0.0.1` instead of `localhost`.

Missing or empty `DATABASE_URL` fails fast on app and Alembic startup. Do not share this
file with `database/.env.local` — mirror credentials by hand.

Footnote: an in-compose backend would use hostname `postgres` on port `5432` instead of
`localhost`; that profile is not first-class for this effort.

### 3. Install and migrate

```bash
uv sync
uv run alembic upgrade head
```

### 4. Run the API (port 8000)

```bash
uv run uvicorn app.main:app --reload --port 8000
```

Optionally open `http://localhost:8000/docs` or `http://localhost:8000/redoc` to exercise
`/tasks` (including `DELETE /tasks/{id}`) against the live API.

### 5. Frontend

Set `VITE_API_URL=http://localhost:8000` and start the TanStack Start app — see
[`frontend/README.md`](../frontend/README.md). The API allows origin
`http://localhost:3000` (`pnpm dev` / `vite dev --port 3000`).

## Layout

```text
app/
  main.py          # FastAPI app, CORS, exception handlers
  config.py        # DATABASE_URL (fail-fast)
  db.py            # engine, SessionLocal, DeclarativeBase
  deps.py          # get_db / SessionDep
  errors.py        # shared { error: { code, message, details } } envelope
  routers/         # HTTP `/tasks` CRUD
  services/        # use-cases
  models/          # SQLAlchemy ORM (Task)
  schemas/         # Pydantic DTOs
alembic/           # sync migrations; shares DATABASE_URL
```

No repository layer — routers → services → models/schemas.
