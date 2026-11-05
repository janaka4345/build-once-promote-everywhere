# Build Once, Promote Everywhere

Companion repository for the article series **Build Once, Promote Everywhere: Production CI/CD from Scratch**.

A small FastAPI + React app and the production-grade pipeline around it: one immutable image, built once, tested, attested, scanned, and promoted through dev, qa, staging and prod.

## Follow along

Each article has a matching tag. Check out the state an article describes with:

    git checkout article-01

| Tag          | Article                                             |
| ------------ | --------------------------------------------------- |
| `article-00` | Part 0: What we're building and how to follow along |
| `article-01` | Part 1.1: Why config belongs at runtime             |

## Run locally

Backend (terminal A):

    cd backend
    $env:APP_ENV = "development"
    uv run fastapi dev main.py

Frontend (terminal B):

    cd frontend
    pnpm install
    pnpm dev

Open http://localhost:5173.

## License

MIT
