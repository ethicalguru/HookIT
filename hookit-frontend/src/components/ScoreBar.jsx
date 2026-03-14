// ScoreBar.jsx
import React from 'react'

function getScoreTone(score = 0) {
  if (score <= 44) return 'safe'
  if (score <= 70) return 'warning'
  return 'danger'
}

export function ScoreBar({ label, value = 0, bold = false }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0))
  const tone = getScoreTone(safeValue)

  return (
    <div className={`scorebar-row ${bold ? 'is-bold' : ''}`}>
      <div className="scorebar-header">
        <span className="scorebar-label">{label}</span>
        <span className={`scorebar-value ${tone}`}>{safeValue}</span>
      </div>
      <div className="scorebar-track">
        <div
          className={`scorebar-fill ${tone}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}