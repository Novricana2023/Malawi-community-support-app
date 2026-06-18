# Dela Langa — Community Development Management System

**"Every citizen has a voice. Every community issue has a path to resolution."**

Dela Langa is a smart citizen engagement and community development management platform designed for Malawi. It connects citizens directly with the District Commissioner's Office for faster reporting, tracking, accountability, and resolution of community development challenges.

## Features

### Citizen Platform
- Secure login (Google OAuth ready + demo mode)
- Auto-generated Citizen ID (e.g. `DL-CIT-000001`)
- Report community issues with photos, GPS, and urgency detection
- PDF receipt generation for every report
- Delivery-style progress tracking
- Real-time notifications (in-app + **email alerts**)

### Government Portal
- Analytics dashboard with KPIs and charts
- Report management (search, filter, assign, resolve)
- Community map with hotspots
- Department assignment workflow
- Official feedback to citizens
- Export district development reports (PDF)

### Smart Features
- Automatic priority detection (Emergency / High / Normal)
- Public transparency portal
- Full activity history for accountability

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, Leaflet |
| Backend | FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| PDF | ReportLab |

## Quick Start (Local)

### 1. Start PostgreSQL (optional — SQLite used by default locally)

```bash
docker compose up -d
```

Set `DATABASE_URL=postgresql://delalanga:delalanga2026@localhost:5432/delalanga` in `backend/.env` to use Postgres locally.

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Deploy on Render (Production)

This project includes a **`render.yaml`** Blueprint for one-click deployment.

1. Push the repo to GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint**
3. Connect the repo and click **Apply**

See **[RENDER.md](./RENDER.md)** for the full deployment guide, environment variables, and troubleshooting.

**Live stack:** PostgreSQL + FastAPI API + Next.js frontend — all on Render free tier.

## Demo Accounts

| Role | Login |
|------|-------|
| Citizen | Choose "Citizen" → enter name & email → Continue |
| Official | Choose "District Commissioner's Office" → `official@soso.malawi.gov.mw` |

## API Documentation

Once the backend is running: **http://localhost:8000/docs**

## Database Schema

- **users** — Citizens and officials
- **reports** — Community issue reports
- **departments** — Government departments
- **feedback** — Citizen and official messages
- **notifications** — Real-time alerts
- **activity_history** — Full audit trail

## License

Built for Malawi's digital transformation initiative.
