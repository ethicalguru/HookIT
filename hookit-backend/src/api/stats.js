// ═══════════════════════════════════════════════
// Stats API Routes
// GET /api/stats — aggregated KPIs for current user
// Returns: total, safe, suspicious, phishing, volumeByDay, topBrands, emails
// ═══════════════════════════════════════════════

import { Router } from 'express'
import { supabaseService } from '../lib/supabase.js'

export const statsRoutes = Router()

statsRoutes.get('/', async (req, res) => {
  try {
    const { data: emails, error } = await supabaseService
      .from('emails')
      .select('*')
      .eq('user_id', req.user.id)
      .order('received_at', { ascending: false })

    if (error) throw error

    const total      = emails.length
    const safe       = emails.filter(e => e.verdict === 'safe').length
    const suspicious = emails.filter(e => e.verdict === 'suspicious').length
    const phishing   = emails.filter(e => e.verdict === 'phishing').length

    // Volume by day (last 30 days)
    const volumeMap = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      volumeMap[key] = 0
    }
    for (const e of emails) {
      if (!e.received_at) continue
      const key = new Date(e.received_at).toISOString().slice(0, 10)
      if (key in volumeMap) volumeMap[key]++
    }
    const volumeByDay = Object.entries(volumeMap).map(([date, count]) => ({ date, count }))

    // Top impersonated brands
    const brandMap = {}
    for (const e of emails) {
      if (e.impersonation_target) {
        brandMap[e.impersonation_target] = (brandMap[e.impersonation_target] || 0) + 1
      }
    }
    const topBrands = Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    res.json({ total, safe, suspicious, phishing, volumeByDay, topBrands, emails })
  } catch (err) {
    console.error('[stats] Error:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})
