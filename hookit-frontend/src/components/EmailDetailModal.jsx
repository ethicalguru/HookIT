// EmailDetailModal.jsx
import React, { useEffect } from 'react'
import { ScoreBar } from './ScoreBar'
import { VerdictBadge } from './VerdictBadge'

function readAnalysis(email) {
  if (!email) return { urlScore: 0, headerScore: 0, aiScore: 0, finalScore: 0, spf: 'unknown', dkim: 'unknown', maliciousUrls: [], reasons: [], impersonationTarget: null, urgent: false }

  return {
    urlScore: email.url_score ?? 0,
    headerScore: email.header_score ?? 0,
    aiScore: email.ai_score ?? 0,
    finalScore: email.final_score ?? 0,
    spf: email.spf_pass ? 'pass' : 'fail',
    dkim: email.dkim_pass ? 'pass' : 'fail',
    maliciousUrls: email.malicious_urls ?? [],
    reasons: email.reasons ?? [],
    impersonationTarget: email.impersonation_target ?? null,
    urgent: Boolean(email.urgency_flag),
  }
}

export function EmailDetailModal({ email, onClose }) {
  const details = readAnalysis(email)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!email) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Email Analysis</h2>
            <p className="modal-subtitle">Full verdict breakdown and AI reasoning</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="meta-card">
              <span className="meta-label">From</span>
              <span className="meta-value">{email.sender || 'Unknown sender'}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Subject</span>
              <span className="meta-value">{email.subject || '(No subject)'}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Received</span>
              <span className="meta-value">
                {email.received_at ? new Date(email.received_at).toLocaleString() : '—'}
              </span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Verdict</span>
              <span className="meta-value">
                <VerdictBadge verdict={email.verdict} />
              </span>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Score Breakdown</h3>
            <ScoreBar label="URL Risk" value={details.urlScore} />
            <ScoreBar label="Header Risk" value={details.headerScore} />
            <ScoreBar label="AI Risk" value={details.aiScore} />
            <ScoreBar label="Final (weighted)" value={details.finalScore} bold />
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Authentication</h3>
            <div className="auth-grid">
              <span className={`auth-pill ${String(details.spf).toLowerCase() === 'pass' ? 'pass' : 'fail'}`}>
                SPF: {details.spf}
              </span>
              <span className={`auth-pill ${String(details.dkim).toLowerCase() === 'pass' ? 'pass' : 'fail'}`}>
                DKIM: {details.dkim}
              </span>
            </div>
          </div>

          {!!details.impersonationTarget && (
            <div className="modal-section">
              <h3 className="modal-section-title">Impersonation Target</h3>
              <span className="brand-chip">{details.impersonationTarget}</span>
            </div>
          )}

          {details.urgent && (
            <div className="modal-section">
              <div className="urgency-banner">Urgency language detected in this email</div>
            </div>
          )}

          <div className="modal-section">
            <h3 className="modal-section-title">Malicious URLs</h3>
            {details.maliciousUrls.length === 0 ? (
              <p className="modal-empty">No flagged URLs</p>
            ) : (
              <ul className="modal-list">
                {details.maliciousUrls.map((url, index) => (
                  <li key={`${url}-${index}`}>{url}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Claude AI Reasons</h3>
            {details.reasons.length === 0 ? (
              <p className="modal-empty">No AI reasoning available</p>
            ) : (
              <ul className="modal-list">
                {details.reasons.map((reason, index) => (
                  <li key={`${reason}-${index}`}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}