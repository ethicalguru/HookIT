import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(14, 22, 48, 0.95)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '10px',
  color: '#e8ecf4',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}

const COLORS = {
  Safe: '#10b981',
  Suspicious: '#f59e0b',
  Phishing: '#ef4444',
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#e8ecf4" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function VerdictPie({ data }) {
  const pieData = [
    { name: 'Safe',       value: data?.safe ?? 0 },
    { name: 'Suspicious', value: data?.suspicious ?? 0 },
    { name: 'Phishing',   value: data?.phishing ?? 0 },
  ].filter((item) => item.value > 0)

  const total = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="chart-card">
      <h3 className="chart-title">Verdict Breakdown</h3>
      {total === 0 ? (
        <div className="chart-empty">No emails analyzed yet</div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <defs>
                <filter id="pieGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={88}
                dataKey="value"
                paddingAngle={4}
                label={CustomLabel}
                labelLine={false}
                stroke="rgba(6,10,20,0.8)"
                strokeWidth={2}
                filter="url(#pieGlow)"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#5a6b8a' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'Outfit' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
