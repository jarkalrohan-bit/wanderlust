
# WanderLust

A full-stack travel blogging application.

## Technology
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- Docker + Docker Compose
- GitHub Actions

## Prerequisites
- Git
- Docker
- Docker Compose

## Installation

1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Generate a JWT secret.
4. Start the containers.

```bash
git clone YOUR_REPOSITORY_URL
cd WanderLust
cp .env.example .env
```

Update JWT_SECRET inside .env.

```bash
docker compose up --build -d
```

## Application URLs

Frontend: http://localhost:3000

Backend: http://localhost:5000

Health: http://localhost:5000/health

## Useful commands

```bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose restart
docker compose down
docker compose down -v
```

WARNING:
docker compose down -v deletes the MongoDB volume and its stored data.

## API endpoints

POST   /api/auth/register
POST   /api/auth/login

GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id

