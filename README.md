# CRM Core (Node.js + React)

Monorepo with:

- `apps/api` - NestJS + Prisma + PostgreSQL
- `apps/web` - React + Vite + React Query

## 1) Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

## 2) Install

```bash
npm install
```

## 3) Environment

Copy values from `.env.example`.

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_core?schema=public"
JWT_SECRET="dev_only_secret_change_me"
PORT=3000
```

Create `apps/web/.env`:

```env
VITE_API_URL="http://localhost:3000"
```

## 4) Start database

```bash
docker compose up -d
```

## 5) Run Prisma migration

```bash
npm run db:migrate
```

## 6) Run API + web together

```bash
npm run dev
```

## API endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /contacts` (JWT required)
- `POST /contacts` (JWT required)
- `PATCH /contacts/:id` (JWT required)
- `GET /deals` (JWT required)
- `POST /deals` (JWT required)
- `PATCH /deals/:id` (JWT required)
- `GET /health`

## Production Docker (Ubuntu/Portainer)

The repository includes a ready stack:

- `docker-compose.portainer.yml`
- `Dockerfile.api`
- `Dockerfile.web`
- `caddy/Caddyfile` (automatic HTTPS by Caddy)
- `.env.portainer.example`

### 1) DNS

Point A record of your domain to your Ubuntu server IP:

- `normativ.pro -> <SERVER_IP>`

### 2) Prepare environment

Create `.env.portainer` from example and set strong secrets:

```env
DOMAIN=normativ.pro
POSTGRES_PASSWORD=your_strong_db_password
JWT_SECRET=your_long_random_jwt_secret
```

### 3) Deploy in Portainer (Stack)

1. Open Portainer -> **Stacks** -> **Add stack**
2. Use this compose file: `docker-compose.portainer.yml`
3. Add environment variables from `.env.portainer`
4. Deploy stack

The app will be available at:

- `https://normativ.pro`

API will be reverse-proxied automatically:

- `https://normativ.pro/api/*`

### 4) First user

After deploy, register first account:

`POST https://normativ.pro/api/auth/register`

Body example:

```json
{
  "email": "admin@normativ.pro",
  "password": "StrongPassword123!",
  "firstName": "Admin",
  "lastName": "Owner",
  "organizationName": "Normativ CRM"
}
```
