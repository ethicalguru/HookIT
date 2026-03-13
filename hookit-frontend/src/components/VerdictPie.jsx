// ═══════════════════════════════════════════════
// Verdict Pie Chart — safe / suspicious / phishing
// ═══════════════════════════════════════════════

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = {
  safe:       '#3B6D11',
  suspicious: '#854F0B',
  phishing:   '#A32D2D',
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
    return <p className="chart-empty">No verdict data yet</p>
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
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#888'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
