import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export default function VerdictPie({ data }) {
  const pieData = [
    { name: 'Safe', value: data?.safe ?? 0, color: '#4ade80' },
    { name: 'Suspicious', value: data?.suspicious ?? 0, color: '#fb923c' },
    { name: 'Phishing', value: data?.phishing ?? 0, color: '#f87171' },
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
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}