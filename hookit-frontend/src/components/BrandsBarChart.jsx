import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  borderRadius: '10px',
  color: '#1d1d1f',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  fontSize: '13px',
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
                  <stop offset="0%" stopColor="#ff3b30" />
                  <stop offset="100%" stopColor="#ff6961" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis
                type="number"
                tick={{ fill: '#86868b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                tickLine={false}
              />
              <YAxis
                type="category" dataKey="brand" width={90}
                tick={{ fill: '#6e6e73', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#86868b' }}
                cursor={{ fill: 'rgba(255,59,48,0.03)' }}
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
