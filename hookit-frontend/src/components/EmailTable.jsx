import { VerdictBadge } from './VerdictBadge'

export function EmailTable({ emails, onSelect }) {
  if (!emails?.length) {
    return (
      <p className="table-empty">
        No emails analysed yet. Send a test email to your proxy address to get started!
      </p>
    )
  }

  return (
    <div className="email-table-wrap">
      <table className="email-table">
        <thead>
          <tr>
            <th>Verdict</th>
            <th>Score</th>
            <th>Sender</th>
            <th>Subject</th>
            <th>Time</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr key={email.id} className={`row-${email.verdict}`}>
              <td><VerdictBadge verdict={email.verdict} /></td>
              <td className="score-cell">
                <span style={{
                  color: email.final_score >= 70 ? 'var(--accent-red)'
                    : email.final_score >= 45 ? 'var(--accent-amber)'
                    : 'var(--accent-green)',
                }}>
                  {email.final_score}
                </span>
              </td>
              <td className="sender-cell">{email.sender}</td>
              <td className="subject-cell">{email.subject}</td>
              <td className="time-cell">
                {email.received_at ? new Date(email.received_at).toLocaleString() : '—'}
              </td>
              <td>
                <button className="btn-view" onClick={() => onSelect(email)}>
                  View →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
