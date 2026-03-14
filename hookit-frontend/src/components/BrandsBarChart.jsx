// ═══════════════════════════════════════════════
// Top Impersonated Brands — BarChart
// ═══════════════════════════════════════════════

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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
      <p style={{ color: '#e1e4ec', margin: 0 }}>
        <strong>{label}</strong>: {payload[0].value} email{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function BrandsBarChart({ emails }) {
  const data = useMemo(() => {
    const counts = {}
    ;(emails || []).forEach(e => {
      if (e.impersonation_target && e.impersonation_target !== 'null') {
        const brand = e.impersonation_target
        counts[brand] = (counts[brand] || 0) + 1
      }
    })

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [emails])

  if (!data.length) {
    return (
      <div className="chart-empty">
        <span className="chart-empty-icon">🏢</span>
        <p>No impersonation data yet</p>
        <p className="chart-empty-hint">Brands being impersonated in phishing emails will appear here</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid stroke="#2e3140" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8b8fa3' }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8b8fa3' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(83, 74, 183, 0.08)' }} />
        <Bar dataKey="count" fill="#7B73E0" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
