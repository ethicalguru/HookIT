# HookIT — API Contracts
# Shared reference for frontend ↔ backend communication

This document defines every API endpoint, its request shape, and response shape.
Person C + D (frontend) and Person A + B (backend) should both use this as the source of truth.

---

## Auth Header (all /api/* routes)

```
Authorization: Bearer <supabase_jwt_access_token>
```

Get the token from:
```js
const { data: { session } } = await supabase.auth.getSession()
session.access_token  // ← this is the JWT
```

---

## Endpoints

### `GET /health`
No auth required. Health check.

**Response:**
```json
{ "status": "ok", "service": "hookit-backend", "timestamp": "2026-03-14T..." }
```

---

### `POST /api/onboard`
Called after first Google OAuth login. Creates user + proxy address.

**Request:** No body needed (user info extracted from JWT)

**Response:**
```json
{ "proxy_address": "alice.3f2a@shield.yourdomain.com" }
```

---

### `GET /api/quarantine`
List all quarantined emails for the logged-in user.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "received_at": "2026-03-14T10:30:00Z",
    "sender": "attacker@evil.com",
    "recipient": "alice.3f2a@shield.yourdomain.com",
    "subject": "Your account has been limited",
    "body_text": "Click here to verify...",
    "status": "quarantined",
    "verdict": "phishing",
    "final_score": 87,
    "url_score": 80,
    "header_score": 60,
    "ai_score": 92,
    "reasons": ["Urgency language detected", "PayPal impersonation"],
    "urgency_flag": true,
    "impersonation_target": "PayPal",
    "spf_pass": false,
    "dkim_pass": false,
    "malicious_urls": ["http://paypa1-secure-login.com/verify"]
  }
]
```

---

### `POST /api/quarantine/:id/release`
Release a quarantined email — forwards it to user's real inbox.

**Response:**
```json
{ "ok": true }
```

**Errors:**
```json
{ "error": "Not found" }  // 404 — email not found or not yours
```

---

### `DELETE /api/quarantine/:id`
Soft-delete a quarantined email (marks status as "deleted").

**Response:**
```json
{ "ok": true }
```

---

### `GET /api/stats`
Aggregated KPIs for the logged-in user. (Backup endpoint — frontend can also query Supabase directly.)

**Response:**
```json
{
  "total": 42,
  "blocked": 8,
  "passed": 34,
  "avgScore": 18,
  "passRate": 81
}
```

---

### `POST /webhook/email`  (Mailgun → Backend, NO auth)
Mailgun sends this as multipart/form-data. Not called by frontend.

**Key fields in req.body:**
- `recipient` — proxy address
- `sender` — original sender
- `subject`
- `stripped-text` — plain text body
- `body-html` — HTML body
- `message-headers` — JSON string of header arrays

---

## Supabase Direct Queries (Frontend via RLS)

The frontend can also query Supabase directly. RLS ensures users only see their own rows.

```js
// All emails for current user (RLS auto-filters)
const { data } = await supabase.from('emails').select('*').order('received_at', { ascending: false })

// Quarantined only
const { data } = await supabase.from('emails').select('*').eq('status', 'quarantined')

// Stats (verdict + score)
const { data } = await supabase.from('emails').select('verdict, final_score, status')
```
