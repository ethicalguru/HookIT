const KPI_ITEMS = [
  {
    icon: '📧',
    label: 'Total Emails',
    key: 'total',
    color: '#60a5fa',
  },
  {
    icon: '✅',
    label: 'Safe',
    key: 'safe',
    color: '#4ade80',
  },
  {
    icon: '⚠️',
    label: 'Suspicious',
    key: 'suspicious',
    color: '#fb923c',
  },
  {
    icon: '🎣',
    label: 'Phishing',
    key: 'phishing',
    color: '#f87171',
  },
]

export default function KpiCards({ stats }) {
  if (!stats) {
    return (
      <div className="kpi-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="kpi-card kpi-skeleton" key={index}>
            <div className="kpi-skeleton-line kpi-skeleton-icon" />
            <div className="kpi-skeleton-line kpi-skeleton-value" />
            <div className="kpi-skeleton-line kpi-skeleton-label" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="kpi-grid">
      {KPI_ITEMS.map((item) => (
        <div className="kpi-card" key={item.key}>
          <span className="kpi-icon">{item.icon}</span>
          <div className="kpi-value" style={{ color: item.color }}>
            {stats?.[item.key] ?? '—'}
          </div>
          <div className="kpi-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}