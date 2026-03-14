// ═══════════════════════════════════════════════
// useStats Hook — Aggregated KPIs for current user
// Fetches from Supabase (RLS auto-filters by user)
// ═══════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('emails')
          .select('verdict, final_score, status')

        if (error) {
          console.error('Stats fetch error:', error.message)
          return
        }

        if (!data) return

        const total    = data.length
        const blocked  = data.filter(e => e.verdict !== 'safe').length
        const passed   = total - blocked
        const avgScore = total
          ? Math.round(data.reduce((s, e) => s + (e.final_score || 0), 0) / total)
          : 0
        const passRate = total ? Math.round((passed / total) * 100) : 0

        setStats({ total, blocked, passed, avgScore, passRate })
      } catch (err) {
        console.error('Stats load error:', err)
      }
    }
    load()
  }, [])

  return [stats, setStats]
}
