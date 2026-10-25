# Task Tracker — Startup Guide

This guide walks you through setting up and running the full-stack Task Tracker application locally across all three tiers:
1. **Database**: PostgreSQL with pgvector (via Docker Compose)
2. **Backend**: FastAPI API with Alembic migrations and SQLAlchemy (Python + `uv`)
3. **Frontend**: TanStack Start React application with Tailwind CSS and shadcn UI (`pnpm`)

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Docker Desktop** (or Docker Engine with Docker Compose)
- **Python**: `>= 3.11`
- **[uv](https://docs.astral.sh/uv/)**: Fast Python package manager (run `curl -LsSf https://astral.sh/uv/install.sh | sh` or `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`)
- **Node.js**: `>= 20.x`
- **[pnpm](https://pnpm.io/)**: Fast Node package manager (`npm install -g pnpm` or `corepack enable`)

---

## 🚀 Quick Start (Step-by-Step)

Follow these steps in separate terminal windows for each service.

### Step 1: Start PostgreSQL Database

1. Navigate to the `database` directory:
   ```bash
   cd database
   ```

2. Create the local environment file from the sample:
   - **Linux / macOS / Git Bash / PowerShell**:
     ```bash
     cp .env.sample .env.local
     ```

3. Start the PostgreSQL service using Docker Compose:
   ```bash
   docker compose -f docker-compose-pgvector-latest.yml --env-file .env.local up -d postgres
   ```

   *(Optional: If you also want pgAdmin web UI, run `docker compose -f docker-compose-pgvector-latest.yml --env-file .env.local up -d postgres pgadmin`)*

4. Verify that the container is healthy:
   ```bash
   docker ps
   ```

---

### Step 2: Configure and Start the Backend API

1. In a new terminal, navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create the backend `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

   Verify or edit `backend/.env` to ensure `DATABASE_URL` matches your database credentials:
   ```text
   DATABASE_URL=postgresql+psycopg://admin:template_db_dev_password@localhost:5432/template_db
   ```
   > **Note for Windows Users**: On some Windows setups, `localhost` resolves to IPv6 (`::1`) while Docker binds only to IPv4. If database connection attempts hang, replace `localhost` with `127.0.0.1`:
   > ```text
   > DATABASE_URL=postgresql+psycopg://admin:template_db_dev_password@127.0.0.1:5432/template_db
   > ```

3. Install backend dependencies:
   ```bash
   uv sync
   ```

4. Run database migrations with Alembic:
   ```bash
   uv run alembic upgrade head
   ```

5. Start the FastAPI development server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```

   The backend will start on **http://localhost:8000**.

---

### Step 3: Configure and Start the Frontend

1. In a third terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Create the frontend `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Ensure it contains:
   ```text
   VITE_API_URL=http://localhost:8000
   ```

3. Install frontend dependencies:
   ```bash
   pnpm install
   ```

4. Start the Vite development server:
   ```bash
   pnpm dev
   ```

   The frontend will be available at **http://localhost:3000**.

---

## 🌐 Service URLs & Reference

| Service | URL | Description | Default Credentials |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | Task Tracker web application | — |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI server root | — |
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API documentation & testing | — |
| **ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Alternative API documentation | — |
| **PostgreSQL** | `localhost:5432` | Database instance | User: `admin`<br>Password: `template_db_dev_password`<br>Database: `template_db` |
| **pgAdmin** *(optional)* | [http://localhost:5050](http://localhost:5050) | PostgreSQL web administration tool | Email: `admin@admin.com`<br>Password: `admin` |

---

## 🛠️ Common Commands & Workflows

### Running Backend Migrations
When database models are updated in `backend/app/models/`:
```bash
cd backend
# Create a new migration revision
uv run alembic revision --autogenerate -m "describe changes"

# Apply pending migrations
uv run alembic upgrade head
```

### Stopping the Services
- **Frontend / Backend**: Press `Ctrl + C` in each running terminal.
- **Database**:
  ```bash
  cd database
  docker compose -f docker-compose-pgvector-latest.yml --env-file .env.local down
  ```

---

## 🔍 Troubleshooting

- **`DATABASE_URL` missing or empty error**:
  The backend fails fast if `DATABASE_URL` is not present in `backend/.env`. Ensure you copied `backend/.env.example` to `backend/.env`.
- **Database connection timeout / refused**:
  Verify PostgreSQL is running via `docker ps`. If running on Windows, test with `127.0.0.1` instead of `localhost`.
- **Port 5432 / 8000 / 3000 already in use**:
  Check if another local PostgreSQL instance, web server, or previous development process is holding the port.
- **CORS Issues in Browser**:
  The backend is configured to accept requests from origin `http://localhost:3000`. Ensure the frontend is served on port 3000.
