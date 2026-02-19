# Test-Bot-24-7 — Hanoi Tourism Web App

Phase 1 + Phase 2 scaffold completed:
- ASP.NET Core Web API (.NET 8)
- React + Vite frontend
- Places read for all users; Places CRUD restricted to Admin role
- Basic map (Leaflet)
- JWT auth (register/login)
- Reviews (auth required for create/delete own, and list my reviews)
- Bookings (auth required, list my bookings, cancel own booking)
- Global error handling middleware + console logging
- Docker + docker-compose
- GitHub Actions CI

## Run locally (without Docker)

### Backend
```bash
cd backend/HanoiTourism.Api
dotnet run --urls=http://0.0.0.0:5000
```

### Frontend
```bash
cd frontend/hanoi-tourism-web
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

By default in development, Vite proxy is enabled:
- `/api/*` from frontend is proxied to `http://localhost:5000`
- You can still override API base via `VITE_API_URL` if needed.

## Run with Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Default auth user
- username: `admin`
- password: `admin123`
- role: `Admin`

> Demo-only auth storage is in-memory. Replace with DB + hashed passwords for production.
