# ═══════════════════════════════════════════════════════════════════════
# TODO — Person C: Frontend — Auth + Dashboard Layout + Charts
# ═══════════════════════════════════════════════════════════════════════
# Owner: Person C
# Focus: React SPA — Login page, auth flow, dashboard layout, charts
# Files: hookit-frontend/src/pages/*, components/KpiCards, charts,
#         hooks/useStats, styles/*
# ═══════════════════════════════════════════════════════════════════════


## Context
You own the React frontend — the Login page, Google OAuth flow, main
Dashboard layout, KPI stat cards, and the Recharts visualisations.
The code skeleton is already built. Your job is to install deps, verify
the auth flow works, polish the UI, and make the charts look great.

Stack: React 18 + Vite + Recharts + Supabase JS + CSS (no Tailwind)


## Getting Started
1. cd hookit-frontend
2. cp .env.example .env          ← get values from Person A:
     VITE_SUPABASE_URL            (Supabase project URL)
     VITE_SUPABASE_ANON_KEY       (anon/public key)
     VITE_API_URL                  (Railway backend URL, or http://localhost:3000 for dev)
3. npm install
4. npm run dev                    ← opens on http://localhost:5173


## DAY 1 — Scaffold + Vercel Deployment  (Target: ~4 hours)

### Vite + React Setup [0:00 – 0:45]
- [ ] npm install — verify all deps install cleanly
- [ ] npm run dev — verify blank page loads without errors
- [ ] Deploy shell to Vercel:
      npm i -g vercel && cd hookit-frontend && vercel
      → follow prompts, select Vite preset
- [ ] In Vercel dashboard → Settings → Environment Variables → add all VITE_ vars
- [ ] Verify Vercel URL loads (even if just a blank page for now)

### Google OAuth Integration [0:45 – 1:45]
- [ ] Get Supabase URL + anon key from Person A
- [ ] Review src/supabaseClient.js — verify createClient config
- [ ] Review src/pages/Login.jsx — the Google button is ready
- [ ] Coordinate with Person A: add your Vercel URL to:
      - Supabase → Authentication → URL Configuration → Site URL
      - Supabase → Authentication → URL Configuration → Redirect URLs
        → add: https://your-app.vercel.app/**
- [ ] Test: click "Continue with Google" → redirects to Google → comes back logged in
- [ ] Review src/App.jsx — auth gate should show Login or Dashboard

### Dashboard Header + Proxy Bar [1:45 – 2:30]
- [ ] Review src/pages/Dashboard.jsx — layout structure is ready
- [ ] Verify onboard API call works (POST /api/onboard with JWT)
- [ ] User should see their proxy address in the header bar after login
- [ ] "Copy" button copies proxy address to clipboard
- [ ] User avatar + name displays from Google profile
- [ ] "Sign out" button works

### KPI Cards [2:30 – 3:30]
- [ ] Review src/hooks/useStats.js — Supabase query auto-scoped by RLS
- [ ] Review src/components/KpiCards.jsx — 4 stat tile cards
- [ ] Style the cards — make them look polished:
      - Large number with color coding
      - Subtle label above
      - Maybe add a small icon or trend indicator
- [ ] Test with data: if no emails yet, show "—" gracefully

### Charts [3:30 – 4:00]  (verify + polish; skeleton is built)
- [ ] Review src/components/EmailVolumeChart.jsx — LineChart (30-day view)
- [ ] Review src/components/VerdictPie.jsx — PieChart (safe/suspicious/phishing)
- [ ] Review src/components/BrandsBarChart.jsx — BarChart (top impersonated brands)
- [ ] Verify charts render with sample data
- [ ] Polish: colors, tooltips, responsive sizing
- [ ] Empty state: show "No data yet" when there are no emails


## DAY 2 — Full Dashboard + Styling  (Target: ~8 hours)

### Layout & Responsive [0:00 – 1:00]
- [ ] Review src/styles/global.css — dark theme base
- [ ] Review src/styles/dashboard.css — all component styles
- [ ] Test on different screen widths (responsive grid collapses at 768px)
- [ ] Polish spacing, typography, visual hierarchy
- [ ] Make sure it looks good for the demo (likely on a projector)

### Integration Testing [1:00 – 2:00]
- [ ] Login → see dashboard → proxy address displays
- [ ] KPI cards populate with real data from Supabase
- [ ] Charts show data grouped correctly
- [ ] Tab switcher (All Emails / Quarantine) works

### Realtime Feed [2:00 – 2:30]
- [ ] Review the realtime subscription in Dashboard.jsx (useEffect with supabase.channel)
- [ ] Test: send an email to proxy → new row appears without page refresh
- [ ] KPI cards update on new insert

### Final Polish [2:30 – 4:00]
- [ ] Visual review — consistent spacing, colour usage, readability
- [ ] Loading states for all async operations
- [ ] Error states (API down, no data)
- [ ] Deploy final version to Vercel: `vercel --prod`
- [ ] Verify production URL works end-to-end with Google login


## Key Files You Own
- hookit-frontend/src/main.jsx                      — Vite entry
- hookit-frontend/src/App.jsx                       — Auth gate
- hookit-frontend/src/supabaseClient.js             — Supabase singleton
- hookit-frontend/src/pages/Login.jsx               — Google OAuth login
- hookit-frontend/src/pages/Dashboard.jsx           — Main layout
- hookit-frontend/src/hooks/useStats.js             — KPI hook
- hookit-frontend/src/components/KpiCards.jsx        — Stat tiles
- hookit-frontend/src/components/EmailVolumeChart.jsx — Line chart
- hookit-frontend/src/components/VerdictPie.jsx      — Pie chart
- hookit-frontend/src/components/BrandsBarChart.jsx  — Bar chart
- hookit-frontend/src/styles/global.css              — Global styles
- hookit-frontend/src/styles/dashboard.css           — Dashboard styles
- hookit-frontend/vite.config.js                     — Vite config
- hookit-frontend/index.html                         — HTML shell


## Dependencies
- Person A provides: Supabase URL, anon key, Railway backend URL
- Person A sets up: Google OAuth in Supabase + redirect URLs for your Vercel domain
- Person B provides: seed data in Supabase so charts aren't empty
- Person D builds: EmailTable, QuarantineInbox, EmailDetailModal (you import them)
