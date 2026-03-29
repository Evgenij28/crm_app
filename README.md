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

## Docker Run style install (without compose)

This is the closest format to a single `docker run` command while keeping PostgreSQL separate.

### 1) Publish images to GHCR

After push to `main`, GitHub Actions workflow `.github/workflows/publish-ghcr.yml` publishes:

- `ghcr.io/<github_user>/crm-app-api:latest`
- `ghcr.io/<github_user>/crm-app-web:latest`

### 2) Run containers

Create network and volume:

```bash
docker network create crm-net
docker volume create crm-postgres-data
```

Run PostgreSQL:

```bash
docker run -d \
  --name crm-postgres \
  --network crm-net \
  --restart always \
  -e POSTGRES_DB=crm_core \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=change_this_db_password \
  -v crm-postgres-data:/var/lib/postgresql/data \
  postgres:16
```

Run API:

```bash
docker run -d \
  --name crm-api \
  --network crm-net \
  --restart always \
  -e DATABASE_URL="postgresql://postgres:change_this_db_password@crm-postgres:5432/crm_core?schema=public" \
  -e JWT_SECRET="change_this_very_long_secret" \
  -e PORT=3000 \
  ghcr.io/evgenij28/crm-app-api:latest
```

Run Web:

```bash
docker run -d \
  --name crm-web \
  --network crm-net \
  --restart always \
  -p 3000:80 \
  ghcr.io/evgenij28/crm-app-web:latest
```

Open app:

- `http://<SERVER_IP>:3000`

Register first user:

- `POST http://<SERVER_IP>:3000/api/auth/register`

## Full step-by-step install commands (Ubuntu + Docker run)

Use this when you want to copy/paste all commands in order.

### 0) Docker and permissions

```bash
sudo apt update
sudo apt install -y docker.io curl
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker ps
```

### 1) Optional: login to GHCR (if package is private)

```bash
echo "PASTE_REAL_GITHUB_PAT_HERE" | docker login ghcr.io -u Evgenij28 --password-stdin
```

### 2) Full install block with test secrets

```bash
DB_PASS='TestDbPass_12345'
JWT_SECRET='TestJwtSecret_12345_ChangeInProduction'

docker pull ghcr.io/evgenij28/crm-app-api:latest
docker pull ghcr.io/evgenij28/crm-app-web:latest

docker rm -f crm-web crm-api crm-postgres 2>/dev/null || true
docker network rm crm-net 2>/dev/null || true
docker volume rm crm-postgres-data 2>/dev/null || true

docker network create crm-net
docker volume create crm-postgres-data

docker run -d \
  --name crm-postgres \
  --network crm-net \
  --restart always \
  -e POSTGRES_DB=crm_core \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD="$DB_PASS" \
  -v crm-postgres-data:/var/lib/postgresql/data \
  postgres:16

until docker run --rm --network crm-net postgres:16 \
  pg_isready -h crm-postgres -p 5432 -U postgres -d crm_core >/dev/null 2>&1; do
  sleep 2
done

docker run -d \
  --name crm-api \
  --network crm-net \
  --restart always \
  -e DATABASE_URL="postgresql://postgres:${DB_PASS}@crm-postgres:5432/crm_core?schema=public" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e PORT=3000 \
  ghcr.io/evgenij28/crm-app-api:latest

docker run -d \
  --name crm-web \
  --network crm-net \
  --restart always \
  -p 3000:80 \
  ghcr.io/evgenij28/crm-app-web:latest

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
curl -i http://localhost:3000/api/health
```

### 3) First account

Open in browser:

- `http://<SERVER_IP>:3000`

On login page switch to `Register` and create the first account.
