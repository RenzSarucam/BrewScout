# ☕ Brew Scout

**Find your next great cup, wherever you are.**

Brew Scout is a coffee discovery and travel companion: find nearby coffee
shops, compare them with a transparent recommendation score, get an
estimated route in your preferred travel mode, and save the ones you love.

> Discover → Compare → Navigate → Review — not another Google Maps clone.

## Tech stack

| Layer      | Tech |
|------------|------|
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Laravel 12, PHP 8.2+, Laravel Sanctum |
| Database   | MySQL 8 |
| Maps/Places/Routes | Google Maps JavaScript API, Places API (New), Routes API, Geocoding API |
| Infra      | Docker, Docker Compose, Nginx |

## Project structure

```
BrewScout/
├── frontend/          Next.js app (src/app, src/components, src/lib, src/hooks)
├── backend/            Laravel API (app/Services, app/Http/Controllers/Api/V1, ...)
├── docker/nginx/        Reverse proxy config (/api → PHP-FPM, everything else → Next.js)
└── docker-compose.yml
```

## Getting started

### Prerequisites

- Node.js 20+
- PHP 8.2+ and Composer
- MySQL 8 (or use Docker Compose)
- Google Maps Platform API keys (Maps JavaScript API, Places API (New),
  Routes API, Geocoding API)

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# set DB_* and GOOGLE_*_API_KEY in .env
php artisan migrate
php artisan serve
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
npm run dev
```

### 3. Or run everything with Docker Compose

```bash
docker compose up -d
```

- Frontend: http://localhost
- Backend API: http://localhost/api

## Running tests

```bash
# Backend (Laravel Pint + PHPUnit)
cd backend
vendor/bin/pint
php artisan test

# Frontend (ESLint + type-check via build)
cd frontend
npm run lint
npm run build
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
Never commit real API keys — both files ship with placeholders only.

## Development phases

The MVP was built incrementally, in this order:

1. **Project setup** — scaffolding, Docker, design system
2. **Authentication** — Sanctum-based register/login/logout, password reset
3. **Coffee discovery** — location, Google Places search, filters, map, place details
4. **Recommendation engine** — weighted scoring, sorting, "Brew Scout Recommendation" badges
5. **Directions** — Routes API, travel modes, route summary, navigation handoff
6. **Favorites** *(next)*
7. **Reviews**
8. **Admin**
9. **Compliance** (legal pages, consent)
10. **Polish**

## License

Proprietary — all rights reserved.