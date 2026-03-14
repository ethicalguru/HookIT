import { VerdictBadge } from './VerdictBadge'
import { ScoreBar } from './ScoreBar'

export function EmailDetailModal({ email, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <VerdictBadge verdict={email.verdict} />
          <span className="modal-score">
            Risk score: <strong style={{ color: 'var(--text-primary)' }}>{email.final_score}</strong>/100
          </span>
          <button onClick={onClose} className="modal-close" aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <p><b>From:</b> {email.sender}</p>
          <p><b>Subject:</b> {email.subject}</p>
          <p><b>Received:</b> {new Date(email.received_at).toLocaleString()}</p>

          <hr />

          <h4>Score Breakdown</h4>
          <ScoreBar label="URL check"        score={email.url_score} />
          <ScoreBar label="Header auth"      score={email.header_score} />
          <ScoreBar label="AI analysis"      score={email.ai_score} />
          <ScoreBar label="Final (weighted)" score={email.final_score} bold />

          <hr />

          <h4>Authentication Results</h4>
          <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
            <span style={{
              color: email.spf_pass ? 'var(--accent-green)' : 'var(--accent-red)',
              fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600,
            }}>
              SPF: {email.spf_pass ? '✓ PASS' : '✗ FAIL'}
            </span>
            <span style={{
              color: email.dkim_pass ? 'var(--accent-green)' : 'var(--accent-red)',
              fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600,
            }}>
              DKIM: {email.dkim_pass ? '✓ PASS' : '✗ FAIL'}
            </span>
          </div>

          {email.malicious_urls?.length > 0 && (
            <>
              <hr />
              <h4>⚠ Malicious URLs Detected</h4>
              <ul>
                {email.malicious_urls.map((url, i) => (
                  <li key={i} className="malicious-url">{url}</li>
                ))}
              </ul>
            </>
          )}

          <hr />

          <h4>AI Analysis Reasons</h4>
          <ul>
            {(email.reasons || []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          {email.impersonation_target && (
            <p className="impersonation">
              <b>Impersonating:</b> {email.impersonation_target}
            </p>
          )}

          {email.urgency_flag && (
            <p className="urgency-flag">
              ⚠️ Urgency language detected in this email
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
