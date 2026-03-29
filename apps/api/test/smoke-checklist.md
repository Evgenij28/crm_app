# Smoke checklist

Use these checks after deploy:

1. `GET /api/health` returns `200` and `{ "status": "ok" }`
2. `POST /api/auth/login` with invalid payload returns `400`
3. `GET /api/contacts` without token returns `401`
4. Register from UI works and redirects to protected pages
5. Deal moves across kanban columns and appears in timeline
6. Linked task creation appears in deal card and task board
