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

const app    = express()
const upload = multer()

// ── Middleware ─────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json())

// ── Health check ──────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hookit-backend', timestamp: new Date().toISOString() })
})

// ── Mailgun Inbound Webhook ───────────────────
app.post('/webhook/email', upload.any(), async (req, res) => {
  // ACK Mailgun immediately — never make it wait
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
      rawHeaders: req.body['message-headers'],
    }

    await analyseEmail(email)
    console.log(`[webhook] Processed email for ${user.email}: ${email.subject}`)
  } catch (err) {
    console.error('[webhook] Error processing email:', err)
  }
})

// ── Authenticated API Routes ──────────────────
app.use('/api/onboard',    requireAuth, onboardRoutes)
app.use('/api/quarantine', requireAuth, quarantineRoutes)
app.use('/api/stats',      requireAuth, statsRoutes)

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🪝 HookIT backend running on port ${PORT}`)
})
