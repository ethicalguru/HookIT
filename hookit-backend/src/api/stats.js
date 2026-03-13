// ═══════════════════════════════════════════════
// Stats API Routes
// GET /api/stats — aggregated KPIs for current user
// (Backup endpoint — frontend can also query Supabase directly via RLS)
// ═══════════════════════════════════════════════

import { Router } from 'express'
import { supabaseService } from '../lib/supabase.js'

export const statsRoutes = Router()

statsRoutes.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseService
      .from('emails')
      .select('verdict, final_score, status')
      .eq('user_id', req.user.id)

    if (error) throw error

    const total   = data.length
    const blocked = data.filter(e => e.verdict !== 'safe').length
    const passed  = total - blocked
    const avgScore = total
      ? Math.round(data.reduce((s, e) => s + (e.final_score || 0), 0) / total)
      : 0
    const passRate = total ? Math.round((passed / total) * 100) : 0

    res.json({ total, blocked, passed, avgScore, passRate })
  } catch (err) {
    console.error('[stats] Error:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})
