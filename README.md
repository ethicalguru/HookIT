# HookIT 🪝

**AI-Powered Email Phishing Detection Platform**

UNIHACK Hackathon — 2 Day Sprint

Email Phishing Detection · Proxy Forwarding · Multi-User SaaS

---

## What is HookIT?

HookIT is a multi-user email phishing interception platform. Each user signs in with Google OAuth and receives a unique proxy email address (e.g. `alice.3f2a@shield.yourdomain.com`). All mail sent to that address is analysed in real time by three parallel engines — URL scanning, header auth checks, and Claude AI — then either forwarded clean or quarantined. Users log in to their personal dashboard to see KPI cards, email analysis stats, and their quarantine inbox.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Email | Mailgun (inbound webhooks + outbound forwarding) |
| AI | Claude (Anthropic) |
| URL Scanning | Google Safe Browsing API |
| Auth + DB | Supabase (Google OAuth + Postgres + RLS + Realtime) |
| Frontend | React 18 + Vite + Recharts |
| Deploy | Railway (backend) + Vercel (frontend) |

## Project Structure

```
HookIT/
├── hookit-backend/          ← Express API server
│   ├── src/
│   │   ├── index.js         ← Main server + webhook
│   │   ├── lib/
│   │   │   └── supabase.js  ← Supabase service client
│   │   ├── middleware/
│   │   │   └── requireAuth.js ← JWT verification
│   │   ├── api/
│   │   │   ├── onboard.js   ← Proxy address generation
│   │   │   ├── quarantine.js ← Quarantine CRUD
│   │   │   └── stats.js     ← KPI stats endpoint
│   │   └── services/
│   │       ├── analyseEmail.js  ← Orchestrator (Promise.all)
│   │       ├── checkUrls.js     ← Google Safe Browsing
│   │       ├── checkHeaders.js  ← SPF/DKIM/ARC
│   │       ├── claudeAnalyse.js ← Claude AI
│   │       └── forwardEmail.js  ← Mailgun outbound
│   ├── .env.example
│   └── package.json
│
├── hookit-frontend/         ← React SPA
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx          ← Auth gate
│   │   ├── supabaseClient.js
│   │   ├── pages/
│   │   │   ├── Login.jsx    ← Google OAuth
│   │   │   └── Dashboard.jsx ← Main layout
│   │   ├── components/
│   │   │   ├── KpiCards.jsx
│   │   │   ├── EmailVolumeChart.jsx
│   │   │   ├── VerdictPie.jsx
│   │   │   ├── BrandsBarChart.jsx
│   │   │   ├── EmailTable.jsx
│   │   │   ├── QuarantineInbox.jsx
│   │   │   ├── EmailDetailModal.jsx
│   │   │   ├── VerdictBadge.jsx
│   │   │   └── ScoreBar.jsx
│   │   ├── hooks/
│   │   │   └── useStats.js
│   │   └── styles/
│   │       ├── global.css
│   │       └── dashboard.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql           ← Full Supabase schema + RLS
│
├── TODO-PERSON-A-BACKEND.md
├── TODO-PERSON-B-ANALYSIS.md
├── TODO-PERSON-C-FRONTEND-DASHBOARD.md
├── TODO-PERSON-D-FRONTEND-COMPONENTS.md
└── SETUP.md                 ← Quick-start guide
```

## Team Roles

| Person | Role | Focus |
|--------|------|-------|
| **A** | Backend Lead + Infra | Express server, webhook, deployment, Supabase/Mailgun/Railway setup |
| **B** | Analysis Engineer | 3 analysis engines (URL, Header, AI), scoring calibration |
| **C** | Frontend — Dashboard | Login, auth flow, KPI cards, charts, Vercel deployment |
| **D** | Frontend — Components | Email table, quarantine inbox, detail modal, badges |

## Quick Start

See [SETUP.md](SETUP.md) for full setup instructions.

```bash
# Backend
cd hookit-backend
cp .env.example .env    # fill in API keys
npm install
npm run dev

# Frontend (separate terminal)
cd hookit-frontend
cp .env.example .env    # fill in Supabase + API URL
npm install
npm run dev
```

## License

MIT
