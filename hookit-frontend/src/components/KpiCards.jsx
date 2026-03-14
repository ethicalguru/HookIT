const KPI_ITEMS = [
  { icon: '📧', label: 'Total Emails', key: 'total',      theme: 'blue' },
  { icon: '✅', label: 'Safe',         key: 'safe',       theme: 'green' },
  { icon: '⚠️', label: 'Suspicious',   key: 'suspicious', theme: 'amber' },
  { icon: '🎣', label: 'Phishing',     key: 'phishing',   theme: 'red' },
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
          <div className={`kpi-icon-wrap ${item.theme}`}>{item.icon}</div>
          <div className={`kpi-value ${item.theme}`}>{stats?.[item.key] ?? '—'}</div>
          <div className="kpi-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
