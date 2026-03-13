// ═══════════════════════════════════════════════
// Top Impersonated Brands — BarChart
// ═══════════════════════════════════════════════

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

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
    return <p className="chart-empty">No impersonation data yet</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#534AB7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
