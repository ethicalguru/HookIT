export function ScoreBar({ label, score, bold }) {
  const pct = Math.min(Math.max(score || 0, 0), 100)
  const color = pct >= 70 ? 'var(--accent-red)'
              : pct >= 45 ? 'var(--accent-amber)'
              : 'var(--accent-green)'

  return (
    <div className={`score-bar ${bold ? 'score-bar-bold' : ''}`}>
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="score-bar-value">{score ?? '—'}</span>
    </div>
  )
}
