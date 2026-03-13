# ═══════════════════════════════════════════════════════════════════════
# TODO — Person A: Backend Lead + Infrastructure
# ═══════════════════════════════════════════════════════════════════════
# Owner: Person A
# Focus: Express server, webhook pipeline, deployment, database
# Files: hookit-backend/src/index.js, services/*, api/*, database/
# ═══════════════════════════════════════════════════════════════════════


## Context
You own the backend Express server and the full email analysis pipeline.
Incoming emails hit a Mailgun webhook → your server resolves the proxy
address to a user → runs 3 parallel analysis engines → stores result
in Supabase → forwards clean mail or quarantines the rest.

You also handle the initial cloud infrastructure setup (Supabase, Mailgun,
Railway) and deploy the backend.


## Getting Started
1. cd hookit-backend
2. cp .env.example .env          ← fill in real API keys
3. npm install
4. npm run dev                   ← starts server with --watch


## DAY 1 — Core Pipeline  (Target: ~8 hours)

### Setup & Accounts [0:00 – 1:15]
- [ ] Create Supabase project, copy: Project URL, service_role key, JWT Secret, anon key
- [ ] Run database/schema.sql in Supabase SQL Editor
- [ ] Enable Realtime on the `emails` table (Supabase → Table Editor → emails → Realtime)
- [ ] Create Mailgun account + sandbox domain
- [ ] Create Google Cloud project → enable Safe Browsing API → get API key
- [ ] Create Anthropic account → get Claude API key
- [ ] Share ALL keys with team in a secure channel (needed by Person B + D)

### Google OAuth Setup [0:45 – 1:15]  (coordinate with Person C)
- [ ] Google Cloud → APIs & Services → OAuth consent screen → External → fill details
- [ ] Credentials → Create OAuth 2.0 Client ID → Web application
- [ ] Add redirect URI: https://<your-supabase-project>.supabase.co/auth/v1/callback
- [ ] Copy Client ID + Client Secret → paste into Supabase Auth → Google provider → Save
- [ ] Share Supabase URL + anon key with Person C (frontend needs these)

### Express Server + Webhook [1:15 – 3:00]
- [ ] Review src/index.js — the skeleton is ready
- [ ] npm install && verify server starts (`npm run dev`)
- [ ] Test /health endpoint returns 200
- [ ] Deploy to Railway: `npm i -g @railway/cli && railway login && railway init && railway up`
- [ ] Set all env vars in Railway dashboard → Variables tab
- [ ] Set up Mailgun Receiving Route → forward to https://<railway-url>/webhook/email
- [ ] Send a test email to your Mailgun sandbox → confirm it hits Railway logs

### Analysis Engines [3:00 – 5:00]
- [ ] Review src/services/checkUrls.js — test with a URL-containing email
- [ ] Review src/services/checkHeaders.js — test with sample headers JSON
- [ ] Review src/services/claudeAnalyse.js — test Claude returns valid JSON
- [ ] All three should log properly and handle errors gracefully

### Orchestrator + DB Insert [5:00 – 6:00]
- [ ] Review src/services/analyseEmail.js — Promise.all + weighted scoring
- [ ] Verify emails appear in Supabase `emails` table after webhook fires
- [ ] Check scores look reasonable (safe emails < 45, phishy ones > 45)

### Forwarding + Quarantine API [6:00 – 7:00]
- [ ] Review src/services/forwardEmail.js — test forwarding a safe email
- [ ] Review src/api/quarantine.js — GET/POST/DELETE endpoints
- [ ] Test: quarantined email → release → arrives in real inbox

### Auth Middleware + Onboard [7:00 – 7:30]
- [ ] Review src/middleware/requireAuth.js — verify JWT decoding works
- [ ] Review src/api/onboard.js — first-login creates user + proxy address
- [ ] Test with a Supabase JWT: POST /api/onboard → should return proxy_address

### End-to-end Test [7:30 – 8:00]
- [ ] Full flow: Google login → get proxy → send email → see in Supabase → forward works
- [ ] Share Railway URL with Person C + D (they need VITE_API_URL)


## DAY 2 — Support & Polish

- [ ] Help Person C debug any API integration issues
- [ ] Add better error logging / edge case handling
- [ ] Seed demo data: insert 15-20 sample email rows into Supabase for charts
      (mix of safe/suspicious/phishing, different brands, different dates)
- [ ] Prepare 3 demo emails for the final presentation
- [ ] Final deployment check: Railway running, Mailgun route active, all env vars set


## Key Files You Own
- hookit-backend/src/index.js               — Express app, webhook, route mounting
- hookit-backend/src/services/analyseEmail.js — orchestrator
- hookit-backend/src/services/checkUrls.js    — Google Safe Browsing
- hookit-backend/src/services/checkHeaders.js — SPF/DKIM/ARC
- hookit-backend/src/services/claudeAnalyse.js — Claude AI
- hookit-backend/src/services/forwardEmail.js  — Mailgun outbound
- hookit-backend/src/api/onboard.js           — proxy generation
- hookit-backend/src/api/quarantine.js        — quarantine CRUD
- hookit-backend/src/api/stats.js             — stats endpoint
- hookit-backend/src/lib/supabase.js          — Supabase client
- hookit-backend/src/middleware/requireAuth.js — JWT auth
- database/schema.sql                         — DB schema


## Dependencies on Others
- Person C provides Vercel URL → you add it to CORS + Supabase redirect URLs
- Person D coordinates on API contracts (request/response shapes)
