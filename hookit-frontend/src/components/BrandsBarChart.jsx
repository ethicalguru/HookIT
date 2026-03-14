import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(14, 22, 48, 0.95)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '10px',
  color: '#e8ecf4',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}

export default function BrandsBarChart({ data }) {
  const chartData = Array.isArray(data) ? data.slice(0, 8) : []
  const hasData = chartData.length > 0

  return (
    <section className="chart-card">
      <h3 className="chart-title">Top Impersonated Brands</h3>
      {!hasData ? (
        <div className="chart-empty">No brand data yet</div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis
                type="number"
                tick={{ fill: '#5a6b8a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(59,130,246,0.1)' }}
                tickLine={false}
              />
              <YAxis
                type="category" dataKey="brand" width={90}
                tick={{ fill: '#a0aec7', fontSize: 11, fontFamily: 'Outfit' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#5a6b8a' }}
                cursor={{ fill: 'rgba(239,68,68,0.04)' }}
              />
              <Bar
                dataKey="count"
                fill="url(#barGrad)"
                radius={[0, 6, 6, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
