import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  borderRadius: '10px',
  color: '#1d1d1f',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  fontSize: '13px',
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
                  <stop offset="0%" stopColor="#0071e3" />
                  <stop offset="100%" stopColor="#007aff" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#86868b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                tickFormatter={(d) => d.slice(5)}
                axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#86868b', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#86868b', fontSize: '0.78rem' }}
                cursor={{ stroke: 'rgba(0,113,227,0.15)', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#0071e3', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
