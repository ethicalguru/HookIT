// ═══════════════════════════════════════════════
// Verdict Pie Chart — safe / suspicious / phishing
// ═══════════════════════════════════════════════

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = {
  safe:       '#6ABF40',
  suspicious: '#D4A843',
  phishing:   '#E05555',
}

const LABELS = {
  safe:       '✓ Safe',
  suspicious: '⚠ Suspicious',
  phishing:   '⛔ Phishing',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid #2e3140',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <p style={{ color: COLORS[name] || '#888', margin: 0 }}>
        {LABELS[name] || name}: <strong>{value}</strong>
      </p>
    </div>
  )
}

function renderCustomLabel({ name, percent }) {
  if (percent < 0.05) return null
  return `${(percent * 100).toFixed(0)}%`
}

export function VerdictPie({ emails }) {
  const data = useMemo(() => {
    const counts = (emails || []).reduce((acc, e) => {
      if (e.verdict) acc[e.verdict] = (acc[e.verdict] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [emails])

  if (!data.length) {
    return (
      <div className="chart-empty">
        <span className="chart-empty-icon">🎯</span>
        <p>No verdict data yet</p>
        <p className="chart-empty-hint">Email verdicts will appear here after analysis</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#888'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => LABELS[value] || value}
          wrapperStyle={{ fontSize: 13, color: '#8b8fa3' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
