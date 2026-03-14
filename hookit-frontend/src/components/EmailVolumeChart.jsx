import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(14, 22, 48, 0.95)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '10px',
  color: '#e8ecf4',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
}

export default function EmailVolumeChart({ data }) {
  const hasData = Array.isArray(data) && data.length > 0

  return (
    <section className="chart-card">
      <h3 className="chart-title">Email Volume — 30 Days</h3>
      {!hasData ? (
        <div className="chart-empty">No data yet — send a test email to get started</div>
      ) : (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06d6f2" />
                </linearGradient>
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#5a6b8a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(d) => d.slice(5)}
                axisLine={{ stroke: 'rgba(59,130,246,0.1)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#5a6b8a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#5a6b8a', fontFamily: 'JetBrains Mono', fontSize: '0.78rem' }}
                cursor={{ stroke: 'rgba(6,214,242,0.2)', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#06d6f2', stroke: '#0a0f1e', strokeWidth: 2 }}
                filter="url(#lineGlow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
