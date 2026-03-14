// VerdictBadge.jsx
import React from 'react'

function getVerdictMeta(verdict = '') {
  const value = String(verdict).toLowerCase()

  if (value === 'safe') {
    return { label: 'Safe', className: 'verdict-badge safe' }
  }

  if (value === 'suspicious') {
    return { label: 'Suspicious', className: 'verdict-badge suspicious' }
  }

  return { label: 'Phishing', className: 'verdict-badge phishing' }
}

export function VerdictBadge({ verdict }) {
  const meta = getVerdictMeta(verdict)
  return <span className={meta.className}>{meta.label}</span>
}