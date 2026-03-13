// ═══════════════════════════════════════════════
// Quarantine API Routes
// GET  /api/quarantine           — list quarantined emails
// POST /api/quarantine/:id/release — release & forward
// DELETE /api/quarantine/:id     — mark deleted
// ═══════════════════════════════════════════════

import { Router } from 'express'
import { supabaseService } from '../lib/supabase.js'
import { forwardEmail }    from '../services/forwardEmail.js'

export const quarantineRoutes = Router()

// List quarantined emails for the logged-in user
quarantineRoutes.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseService
      .from('emails')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'quarantined')
      .order('received_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[quarantine] List error:', err)
    res.status(500).json({ error: 'Failed to fetch quarantine' })
  }
})

// Release a quarantined email (forward to user's real inbox)
quarantineRoutes.post('/:id/release', async (req, res) => {
  try {
    const { data: email } = await supabaseService
      .from('emails')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)   // security: own emails only
      .single()

    if (!email) return res.status(404).json({ error: 'Not found' })

    // Get user's real email for forwarding
    const { data: user } = await supabaseService
      .from('users')
      .select('email')
      .eq('id', req.user.id)
      .single()

    await forwardEmail({
      realEmail: user.email,
      from:      email.sender,
      subject:   email.subject,
      text:      email.body_text,
      html:      null,
    })

    await supabaseService
      .from('emails')
      .update({ status: 'released' })
      .eq('id', req.params.id)

    console.log(`[quarantine] Released email ${req.params.id}`)
    res.json({ ok: true })
  } catch (err) {
    console.error('[quarantine] Release error:', err)
    res.status(500).json({ error: 'Failed to release email' })
  }
})

// Delete a quarantined email (soft delete)
quarantineRoutes.delete('/:id', async (req, res) => {
  try {
    await supabaseService
      .from('emails')
      .update({ status: 'deleted' })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    res.json({ ok: true })
  } catch (err) {
    console.error('[quarantine] Delete error:', err)
    res.status(500).json({ error: 'Failed to delete email' })
  }
})
