# Bridge

Bridge is a full-stack family collaboration platform that combines a FastAPI backend with a Vite + React frontend. It provides user management, shared calendars, messaging, and admin tooling to coordinate household activities.

## Architecture

- **Backend:** FastAPI served by `uvicorn`, backed by MongoDB via the `pymongo` driver. An in-memory store is available as a development fallback when the database is unreachable.
- **Frontend:** React 18 + Vite + Tailwind CSS with shadcn/ui components, React Router, and TanStack Query for data fetching.
- **Language & tooling:** Python 3.12 for the backend, TypeScript for the frontend.

## Prerequisites

- Python 3.12+
- Node.js 18+ and `pnpm`
- A MongoDB instance (Atlas or local)
- `git` for source control

## Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd crimson-binturong-sniff

# Backend
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend
pnpm install
```

### 2. Configure environment variables

Create `backend/.env`:

```bash
JWT_SECRET=<random-64-char-hex>
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority&appName=<app>&authSource=admin
```

Notes:
- Use `mongodb://` for local MongoDB if preferred.
- If authentication fails, the backend will log a warning and fall back to the in-memory database (non-persistent).

### 3. Seed an admin user (optional)

```bash
cd backend
./.venv/bin/python create_admin.py
```

This script creates or updates the `admin@gmail.com` user with default credentials. Adjust the script for different seed data.

### 4. Run the development servers

```bash
# From repo root
backend/.venv/bin/uvicorn main:app \
  --app-dir backend \
  --host 0.0.0.0 \
  --port 8000 \
  --reload

# In another terminal
cd frontend
pnpm dev
```

- API: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Health check: `GET http://localhost:8000/healthz`

## Project Structure

```
backend/    FastAPI app, routers, models, and MongoDB integration
frontend/   Vite + React SPA with UI components and pages
```

Consult the documents in the root (e.g., `ONBOARDING_FLOW.md`, `DEV-PRD.md`, `Backend-dev-plan.md`) for deeper product context.

## Scripts & Tooling

- `backend/create_admin.py` – Admin seeding helper.
- `backend/seed.py` – Additional seeding utilities.
- `frontend/package.json` – `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm lint`.

## Testing & Linting

- Frontend linting: `pnpm lint`
- Backend tests: add `pytest` or other frameworks as needed (not yet configured).

## Deployment Notes

- Provide environment variables via the target platform (e.g., Vercel, Render).
- Ensure MongoDB Atlas network access lists include the deployment IPs.
- Consider removing the in-memory fallback for production deployments to avoid accidental data loss.

---

For questions about features or roadmap, review `PRD.md`, `TWO_VIEW_SYSTEM.md`, and related docs in the repository.
