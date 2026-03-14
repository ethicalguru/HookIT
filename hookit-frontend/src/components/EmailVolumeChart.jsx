// ═══════════════════════════════════════════════
// Email Volume Chart — Recharts LineChart
// Shows emails per day (total + blocked) over 30 days
// ═══════════════════════════════════════════════

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid #2e3140',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: '#8b8fa3', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

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
    return (
      <div className="chart-empty">
        <span className="chart-empty-icon">📈</span>
        <p>No email data yet</p>
        <p className="chart-empty-hint">Send a test email to your proxy address to see volume stats</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#2e3140" strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b8fa3' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#8b8fa3' }} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line dataKey="total"   stroke="#7B73E0" strokeWidth={2.5} dot={false} name="Total" />
        <Line dataKey="blocked" stroke="#E05555" strokeWidth={2.5} dot={false} name="Blocked" />
      </LineChart>
    </ResponsiveContainer>
  )
}
