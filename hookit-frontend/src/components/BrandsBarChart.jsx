import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="brand"
                width={90}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" fill="#f87171" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}