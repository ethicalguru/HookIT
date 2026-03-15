import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  borderRadius: '10px',
  color: '#1d1d1f',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  fontSize: '13px',
}

const COLORS = {
  Safe: '#34c759',
  Suspicious: '#ff9500',
  Phishing: '#ff3b30',
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '0.72rem', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
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
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={88}
                dataKey="value"
                paddingAngle={4}
                label={CustomLabel}
                labelLine={false}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#86868b' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
