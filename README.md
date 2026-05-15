# Team Task Manager

A full-stack project management app with JWT authentication, role-based access, projects, kanban task tracking, task comments, and dashboard metrics.

## Stack

- Frontend: React 18, Vite, TanStack Query v5, Axios, dnd-kit, plain CSS
- Backend: FastAPI, Pydantic v2, Beanie ODM, Motor
- Database: MongoDB Atlas
- Auth: JWT access and refresh tokens with `python-jose` and `passlib[bcrypt]`
- Deployment: Railway frontend and backend services

## Repository Layout

```text
backend/
  main.py
  config.py
  database.py
  models/
  schemas/
  routers/
  dependencies.py
  seed.py
  requirements.txt
  .env.example

frontend/
  index.html
  vite.config.js
  src/
    api/
    components/
    context/
    pages/
    utils/
  package.json
```

## Local Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Backend environment variables:

```text
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/team_task_manager
DATABASE_NAME=team_task_manager
SECRET_KEY=replace-with-a-random-32-byte-hex-string
CORS_ORIGINS=http://localhost:5173
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Interactive API docs are available at `http://localhost:8000/docs`.

Seed one admin user manually:

```bash
cd backend
python seed.py
```

Default seed credentials:

```text
email: admin@example.com
username: admin
password: Admin123!
```

## Local Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend environment variables:

```text
VITE_API_URL=http://localhost:8000
```

Create `frontend/.env` with that value for local development.

## API Overview

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `POST /api/projects/{id}/members`

Tasks:

- `GET /api/projects/{id}/tasks`
- `POST /api/projects/{id}/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

Comments:

- `GET /api/tasks/{id}/comments`
- `POST /api/tasks/{id}/comments`
- `DELETE /api/comments/{id}`

Dashboard:

- `GET /api/dashboard`

## RBAC Rules

- Admins can create projects and tasks, add project members, edit all task fields, and delete tasks.
- Project owners and admins can update or delete projects.
- Members can view projects they belong to and update only task status.
- Any project member can comment on tasks.
- Users can delete only their own comments.

## MongoDB Atlas Setup

1. Create a free M0 MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. In Network Access, whitelist `0.0.0.0/0` for Railway egress.
4. Copy the connection string into `MONGO_URI`.
5. Set `DATABASE_NAME` to `team_task_manager` or your preferred database name.

## Railway Deployment

Backend service:

- Root directory: `backend`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `MONGO_URI`
  - `DATABASE_NAME`
  - `SECRET_KEY`
  - `CORS_ORIGINS`
  - `ACCESS_TOKEN_EXPIRE_MINUTES=30`
  - `REFRESH_TOKEN_EXPIRE_DAYS=7`

Frontend service:

- Root directory: `frontend`
- Build command: `npm run build`
- Start command: `npx serve dist`
- Environment variables:
  - `VITE_API_URL=https://your-backend.up.railway.app`

After both services are deployed, update backend `CORS_ORIGINS` with the public frontend Railway URL.

## Architecture Notes

The backend keeps authorization checks close to route handlers through reusable dependencies for current user, admin requirement, project membership, and task access. Beanie documents store MongoDB ObjectIds while response schemas serialize IDs as strings for the React app.

The frontend stores the access token in React memory and the refresh token in `localStorage`. Axios attaches access tokens, refreshes once on `401`, retries the failed request, and redirects to `/login` if refresh fails.
