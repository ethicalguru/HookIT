// ═══════════════════════════════════════════════
// POST /api/onboard — First-login proxy generation
// Called by frontend after first Google OAuth login
// ═══════════════════════════════════════════════

import { Router } from 'express'
import { supabaseService } from '../lib/supabase.js'

export const onboardRoutes = Router()

onboardRoutes.post('/', async (req, res) => {
  try {
    const userId = req.user.id
    const email  = req.user.email

    // Check if already onboarded
    const { data: existing } = await supabaseService
      .from('users')
      .select('proxy_address')
      .eq('id', userId)
      .single()

    if (existing?.proxy_address) {
      return res.json({ proxy_address: existing.proxy_address })
    }

    // Generate unique slug: first name + 4 random chars
    const firstName = email.split('@')[0].split('.')[0].toLowerCase()
    const slug = firstName + '.' + Math.random().toString(36).slice(2, 6)
    const proxy = `${slug}@shield.${process.env.PROXY_DOMAIN}`

    const { error } = await supabaseService.from('users').insert({
      id:            userId,
      email:         email,
      proxy_address: proxy,
    })

    if (error) {
      console.error('[onboard] Insert error:', error)
      return res.status(500).json({ error: 'Failed to create user' })
    }

    console.log(`[onboard] New user: ${email} → ${proxy}`)
    res.json({ proxy_address: proxy })
  } catch (err) {
    console.error('[onboard] Error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})
