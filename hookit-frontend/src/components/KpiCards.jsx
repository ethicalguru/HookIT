// ═══════════════════════════════════════════════
// KPI Cards — 4 stat tiles
// Total Scanned | Blocked | Pass Rate | Avg Risk Score
// ═══════════════════════════════════════════════

export function KpiCards({ stats }) {
  const cards = [
    {
      label: 'Total Scanned',
      value: stats?.total ?? '—',
      color: '#7B73E0',
      bg: 'rgba(83, 74, 183, 0.10)',
      icon: '📧',
    },
    {
      label: 'Blocked',
      value: stats?.blocked ?? '—',
      color: '#E05555',
      bg: 'rgba(163, 45, 45, 0.10)',
      icon: '🛑',
    },
    {
      label: 'Pass Rate',
      value: stats ? `${stats.passRate}%` : '—',
      color: '#6ABF40',
      bg: 'rgba(59, 109, 17, 0.10)',
      icon: '✅',
    },
    {
      label: 'Avg Risk Score',
      value: stats?.avgScore ?? '—',
      color: '#D4A843',
      bg: 'rgba(133, 79, 11, 0.10)',
      icon: '⚡',
      suffix: stats?.avgScore != null ? ' / 100' : '',
    },
  ]

  return (
    <div className="kpi-row">
      {cards.map(card => (
        <div key={card.label} className="kpi-card" style={{ borderTop: `3px solid ${card.color}` }}>
          <div className="kpi-header">
            <span className="kpi-icon" style={{ background: card.bg }}>{card.icon}</span>
            <span className="kpi-label">{card.label}</span>
          </div>
          <span className="kpi-value" style={{ color: card.color }}>
            {card.value}
            {card.suffix && <span className="kpi-suffix">{card.suffix}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}
