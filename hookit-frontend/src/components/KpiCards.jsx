// ═══════════════════════════════════════════════
// KPI Cards — 4 stat tiles
// Total Scanned | Blocked | Pass Rate | Avg Risk Score
// ═══════════════════════════════════════════════

export function KpiCards({ stats }) {
  const cards = [
    { label: 'Total Scanned',  value: stats?.total ?? '—',               color: '#534AB7' },
    { label: 'Blocked',        value: stats?.blocked ?? '—',             color: '#A32D2D' },
    { label: 'Pass Rate',      value: stats ? `${stats.passRate}%` : '—', color: '#3B6D11' },
    { label: 'Avg Risk Score', value: stats?.avgScore ?? '—',            color: '#854F0B' },
  ]

  return (
    <div className="kpi-row">
      {cards.map(card => (
        <div key={card.label} className="kpi-card">
          <span className="kpi-label">{card.label}</span>
          <span className="kpi-value" style={{ color: card.color }}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  )
}
