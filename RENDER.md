# Deploy Dela Langa on Render

This project is configured for **one-click deployment** on [Render](https://render.com) using the included `render.yaml` Blueprint.

## What gets deployed

| Service | Name | Runtime |
|---------|------|---------|
| PostgreSQL database | `dela-langa-db` | Render Postgres (free tier) |
| Backend API | `dela-langa-api` | Python 3.11 / FastAPI |
| Frontend web app | `dela-langa-web` | Node 20 / Next.js 14 |

Live URLs (after deploy):

- **App:** `https://dela-langa-web.onrender.com`
- **API:** `https://dela-langa-api.onrender.com`
- **API docs:** `https://dela-langa-api.onrender.com/docs`

---

## Step-by-step deployment

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "Dela Langa platform"
git remote add origin https://github.com/YOUR_USERNAME/dela-langa.git
git push -u origin main
```

### 2. Create a Render Blueprint

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render detects `render.yaml` automatically
5. Click **Apply** — Render creates all 3 resources

### 3. Wait for the first deploy

- Database provisions first (~1–2 min)
- API builds and starts (`pip install` + uvicorn)
- Frontend builds (`npm install` + `npm run build`)

**First deploy takes 5–10 minutes.** Free-tier services spin down after inactivity; the first visit may take ~30 seconds to wake up.

### 4. (Optional) Add sample data

In the Render dashboard → **dela-langa-api** → **Shell**:

```bash
python seed.py
```

This adds demo citizens and sample reports for presentations.

### 5. Set the frontend URL on the API (optional)

CORS already allows all `*.onrender.com` domains. To set an explicit frontend URL:

**dela-langa-api** → **Environment** → add:

```
FRONTEND_URL=https://dela-langa-web.onrender.com
```

---

## Environment variables (auto-configured)

| Variable | Service | Set by |
|----------|---------|--------|
| `DATABASE_URL` | API | Linked Postgres (`internalConnectionString`) |
| `SECRET_KEY` | API | Auto-generated |
| `NEXT_PUBLIC_API_URL` | Web | Linked API (`RENDER_EXTERNAL_URL`) |
| `PYTHON_VERSION` | API | `3.11.9` |
| `NODE_VERSION` | Web | `20.11.0` |

You do **not** need to set these manually when using the Blueprint.

---

## Email alerts (citizen notifications)

Citizens receive **professional HTML emails** when:

| Event | Email subject |
|-------|----------------|
| Report submitted | `Report Received — DL-2026-000001` |
| Status updated | `Status Update — DL-2026-000001` |
| **Issue resolved or closed** | **`Issue Resolved — DL-2026-000001`** |
| Official feedback | `Government Feedback — DL-2026-000001` |

Resolved emails include the resolution summary and a link to **View Your Solved Issues**.

### Enable on Render

In **dela-langa-api** → **Environment**, add:

```
EMAIL_ENABLED=true
FRONTEND_URL=https://dela-langa-web.onrender.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login-email
SMTP_PASSWORD=your-brevo-smtp-key
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Dela Langa
```

### Recommended SMTP providers (free tiers)

| Provider | SMTP host | Notes |
|----------|-----------|-------|
| [Brevo](https://www.brevo.com) | `smtp-relay.brevo.com` | 300 emails/day free |
| [SendGrid](https://sendgrid.com) | `smtp.sendgrid.net` | User: `apikey`, Password: your API key |
| [Gmail](https://support.google.com/accounts/answer/185833) | `smtp.gmail.com` | Use an App Password, not your login password |

### Local demo mode

With `EMAIL_ENABLED=false` (default), emails are **logged to the API console** instead of sent — useful for development without SMTP.

After changing email env vars on Render, click **Manual Deploy** on the API service.

---

## Manual deploy (without Blueprint)

If you prefer creating services one by one:

### Database

1. **New +** → **PostgreSQL**
2. Name: `dela-langa-db`
3. Copy the **Internal Database URL**

### Backend (Web Service)

| Setting | Value |
|---------|-------|
| Runtime | Python 3 |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health` |

Environment:

```
DATABASE_URL=<Internal Database URL from Postgres>
SECRET_KEY=<random 64-char string>
UPLOAD_DIR=uploads
```

### Frontend (Web Service)

| Setting | Value |
|---------|-------|
| Runtime | Node |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Environment:

```
NEXT_PUBLIC_API_URL=https://dela-langa-api.onrender.com
```

*(Use your actual API URL — no `/api` suffix needed; the app adds it automatically.)*

---

## Important notes

### Free tier limits

- Services **sleep after 15 minutes** of inactivity
- Postgres free tier expires after 90 days (upgrade or export data)
- **File uploads** are stored on ephemeral disk — they are lost on redeploy. For production, add [Render Disks](https://render.com/docs/disks) or cloud storage (S3).

### Custom domain

1. **dela-langa-web** → Settings → Custom Domains → add your domain
2. Update `FRONTEND_URL` on the API to match
3. Add `ALLOWED_ORIGINS=https://yourdomain.com` on the API if needed

### Upgrading for production

For a government demo or pilot, consider:

- **Starter plan** ($7/mo) — no sleep, faster cold starts
- **Render Postgres Starter** — persistent, no 90-day limit
- **Render Disk** on API — persistent file uploads

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend can't reach API | Check `NEXT_PUBLIC_API_URL` on web service; redeploy frontend after changing it |
| Database connection error | Ensure API uses **Internal** Database URL, not External |
| CORS errors | API allows `*.onrender.com`; set `FRONTEND_URL` if using custom domain |
| Build fails on Python | Confirm `runtime.txt` shows `python-3.11.9` |
| Build fails on Node | Confirm `.nvmrc` shows `20.11.0` |

### Health check

```bash
curl https://dela-langa-api.onrender.com/api/health
```

Expected:

```json
{"status":"healthy","platform":"Dela Langa","version":"1.0.0"}
```

---

## Demo login (production)

| Role | How to log in |
|------|---------------|
| **Citizen** | Open app → Citizen → enter name & email |
| **Official** | DC Office → `official@soso.malawi.gov.mw` |

The official account is created automatically on first API startup.
