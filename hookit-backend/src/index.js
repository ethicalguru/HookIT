// ═══════════════════════════════════════════════
// HookIT — Main Express Server
// Owner: Person A (Backend Lead)
// ═══════════════════════════════════════════════

import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import multer  from 'multer'

import { supabaseService }   from './lib/supabase.js'
import { requireAuth }       from './middleware/requireAuth.js'
import { analyseEmail }      from './services/analyseEmail.js'
import { onboardRoutes }     from './api/onboard.js'
import { quarantineRoutes }  from './api/quarantine.js'
import { statsRoutes }       from './api/stats.js'

// ── Env validation ─────────────────────────────────────────────────────────
const CRITICAL_ENV = ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_JWT_SECRET']
const OPTIONAL_ENV = ['MG_KEY', 'MG_DOMAIN', 'PROXY_DOMAIN', 'GEMINI_KEY', 'GOOGLE_SB_KEY']

const missingCritical = CRITICAL_ENV.filter((k) => !process.env[k])
if (missingCritical.length) {
  console.error('❌ Missing CRITICAL env vars:', missingCritical.join(', '))
  process.exit(1)
}

const missingOptional = OPTIONAL_ENV.filter((k) => !process.env[k])
if (missingOptional.length) {
  console.warn('⚠️  Missing optional env vars (some features disabled):', missingOptional.join(', '))
}

const app    = express()
const upload = multer()

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // lock down in production
  credentials: true,                        // required for Supabase auth cookies
}))
app.use(express.json())

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hookit-backend', timestamp: new Date().toISOString() })
})

// ── Mailgun inbound webhook ───────────────────────────────────────────────
app.post('/webhook/email', upload.any(), async (req, res) => {
  // ACK Mailgun immediately — never make it wait or it will retry
  res.sendStatus(200)

  try {
    const recipient = req.body.recipient

    // Resolve proxy address → user
    const { data: user } = await supabaseService
      .from('users')
      .select('id, email')
      .eq('proxy_address', recipient)
      .single()

    if (!user) {
      console.warn(`[webhook] Unknown proxy address: ${recipient}`)
      return
    }

    const email = {
      userId:     user.id,
      realEmail:  user.email,
      from:       req.body.sender,
      to:         recipient,
      subject:    req.body.subject,
      text:       req.body['stripped-text'],
      html:       req.body['body-html'],
      rawHeaders: req.body['message-headers'], // JSON array string from Mailgun
    }

    // Fire-and-forget — res is already sent, explicit .catch for visibility
    analyseEmail(email)
      .then(() => console.log(`[webhook] ✅ Processed: ${user.email} — "${email.subject}"`))
      .catch((err) => console.error('[webhook] ❌ analyseEmail failed:', err))

  } catch (err) {
    console.error('[webhook] ❌ Unexpected error:', err)
  }
})

// ── Authenticated API routes ──────────────────────────────────────────────
// requireAuth applied at router level — one place, can't accidentally skip it
app.use('/api/onboard',    requireAuth, onboardRoutes)
app.use('/api/quarantine', requireAuth, quarantineRoutes)
app.use('/api/stats',      requireAuth, statsRoutes)

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🪝 HookIT backend running on port ${PORT}`))
