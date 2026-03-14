const BADGE = {
  safe:        { label: '✓ Safe',        className: 'badge-safe' },
  suspicious:  { label: '⚠ Suspicious',  className: 'badge-suspicious' },
  phishing:    { label: '⛔ Phishing',    className: 'badge-phishing' },
  quarantined: { label: '🔒 Quarantined', className: 'badge-quarantined' },
  released:    { label: '↗ Released',     className: 'badge-released' },
  deleted:     { label: '🗑 Deleted',     className: 'badge-deleted' },
}

export function VerdictBadge({ verdict }) {
  const config = BADGE[verdict] || { label: verdict || '—', className: '' }
  return (
    <span className={`verdict-badge ${config.className}`}>{config.label}</span>
  )
}
