// ═══════════════════════════════════════════════
// Email Volume Chart — Recharts LineChart
// Shows emails per day (total + blocked) over 30 days
// ═══════════════════════════════════════════════

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

export function EmailVolumeChart({ emails }) {
  const data = useMemo(() => {
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recent = (emails || []).filter(
      e => new Date(e.received_at).getTime() >= since
    )

    const grouped = {}
    recent.forEach(e => {
      const day = e.received_at?.slice(0, 10) // 'YYYY-MM-DD'
      if (!day) return
      if (!grouped[day]) grouped[day] = { day, total: 0, blocked: 0 }
      grouped[day].total++
      if (e.verdict !== 'safe') grouped[day].blocked++
    })

    return Object.values(grouped).sort((a, b) => a.day.localeCompare(b.day))
  }, [emails])

  if (!data.length) {
    return <p className="chart-empty">No email data yet</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Line dataKey="total"   stroke="#534AB7" strokeWidth={2} dot={false} name="Total" />
        <Line dataKey="blocked" stroke="#A32D2D" strokeWidth={2} dot={false} name="Blocked" />
      </LineChart>
    </ResponsiveContainer>
  )
}
