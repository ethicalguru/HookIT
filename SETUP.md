# HookIT — Quick Start Setup Guide

Get every team member running in under 15 minutes.

---

## 1. Prerequisites

- **Node.js** ≥ 18 (`node -v`)
- **npm** ≥ 9 (`npm -v`)
- **Git** (`git --version`)
- A Google account (for OAuth login testing)

---

## 2. Clone & Install

```bash
git clone <your-repo-url>
cd HookIT

# Backend
cd hookit-backend
cp .env.example .env     # ← Person A fills this in first
npm install

# Frontend (new terminal)
cd ../hookit-frontend
cp .env.example .env     # ← Get values from Person A
npm install
```

---

## 3. Environment Variables

### Backend (.env) — Person A fills these in and shares

| Variable | Where to get it |
|----------|----------------|
| `MG_KEY` | Mailgun → Account → API Keys → Private API Key |
| `MG_DOMAIN` | Mailgun → Sending → Domains |
| `PROXY_DOMAIN` | Your custom domain (or use MG_DOMAIN for sandbox) |
| `CLAUDE_KEY` | console.anthropic.com → API Keys |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase → Project Settings → API → **service_role** key |
| `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API → JWT Settings → JWT Secret |
| `GOOGLE_SB_KEY` | Google Cloud → Safe Browsing API → Credentials |
| `PORT` | 3000 (default) |

### Frontend (.env) — Person C fills these

| Variable | Where to get it |
|----------|----------------|
| `VITE_SUPABASE_URL` | Same as backend SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **anon/public** key |
| `VITE_API_URL` | Railway URL (or `http://localhost:3000` for local dev) |

---

## 4. Database Setup (Person A, one-time)

1. Go to [supabase.com](https://supabase.com) → create new project
2. Open **SQL Editor** → New Query
3. Paste the contents of `database/schema.sql` → **Run**
4. Go to **Table Editor** → `emails` table → enable **Realtime**
5. Go to **Authentication** → **Providers** → **Google** → toggle on
6. Paste Google OAuth Client ID + Secret (from Google Cloud Console)
7. Go to **Authentication** → **URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

---

## 5. Google OAuth Setup (Person A, one-time)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project → name it "HookIT"
3. APIs & Services → OAuth consent screen → External
4. Credentials → Create OAuth 2.0 Client ID → Web application
5. Add Authorised redirect URI:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** + **Client Secret** → paste into Supabase Google provider

---

## 6. Run Locally

```bash
# Terminal 1 — Backend
cd hookit-backend
npm run dev
# → Server on http://localhost:3000
# → Test: curl http://localhost:3000/health

# Terminal 2 — Frontend
cd hookit-frontend
npm run dev
# → App on http://localhost:5173
```

---

## 7. Deploy

### Backend → Railway
```bash
npm i -g @railway/cli
cd hookit-backend
railway login
railway init
railway up
# → Set env vars in Railway dashboard → Variables tab
```

### Frontend → Vercel
```bash
npm i -g vercel
cd hookit-frontend
vercel
# → Follow prompts, pick Vite preset
# → Set VITE_ env vars in Vercel dashboard
vercel --prod
```

---

## 8. Mailgun Route Setup (Person A)

1. Mailgun dashboard → Receiving → Create Route
2. Match: `match_recipient(".*@shield.yourdomain.com")`
3. Action: Forward to `https://<railway-url>/webhook/email`
4. Save

---

## 9. Team Communication Checklist

After Person A sets up all services, share these with the team:

- [ ] `SUPABASE_URL` — everyone needs this
- [ ] `SUPABASE_ANON_KEY` — frontend team (C, D)
- [ ] `SUPABASE_JWT_SECRET` — backend only (A, B)
- [ ] `SUPABASE_KEY` (service_role) — backend only (A, B)
- [ ] `Railway URL` — frontend team needs this for VITE_API_URL
- [ ] `Vercel URL` — Person A needs this for CORS + Supabase redirect
- [ ] `CLAUDE_KEY` — backend only (A, B)
- [ ] `GOOGLE_SB_KEY` — backend only (A, B)
- [ ] `MG_KEY` + `MG_DOMAIN` — backend only (A)

---

## 10. Useful Commands

```bash
# Check backend health
curl http://localhost:3000/health

# View Supabase data
# → Go to supabase.com → your project → Table Editor

# Send test email (if Mailgun sandbox)
# → Mailgun dashboard → Sending → test send to proxy address

# Check Railway logs
railway logs

# Redeploy frontend
cd hookit-frontend && vercel --prod
```
