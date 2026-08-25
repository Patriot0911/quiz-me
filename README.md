# quiz-me

Монорепозиторій (npm workspaces) з фронтендом (`apps/web`, Next.js) та бекендом (`apps/api`, NestJS). Містить базову файлову структуру, auth-модуль (JWT access/refresh, ролі `USER`/`VIP`/`ADMIN`) та узагальнений UI-кіт/layout без предметної бізнес-логіки.

## Структура

```
apps/
├── web/   # Next.js frontend
└── api/   # NestJS backend
```

## Швидкий старт

```bash
npm install

# Backend: підняти Postgres, налаштувати apps/api/.env (див. .env.example), прогнати міграції
docker compose -f apps/api/docker-compose.yml up -d
npm run -w apps/api migration:run
npm run -w apps/api seed:run
npm run dev:api

# Frontend: налаштувати apps/web/.env (див. .env.example)
npm run dev:web
```
