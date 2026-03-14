// QuarantineInbox.jsx
import React, { useEffect, useState } from 'react'
import { supabase, API_URL } from '../supabaseClient'
import { VerdictBadge } from './VerdictBadge'

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token || ''
}

export function QuarantineInbox({ onSelect }) {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')

  async function loadQuarantine() {
    setLoading(true)
    setError('')

    try {
      const token = await getAccessToken()

      const response = await fetch(`${API_URL}/api/quarantine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }

      const data = await response.json()
      setEmails(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load quarantine:', err)
      setError('Could not load quarantine emails.')
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuarantine()
  }, [])

  async function handleRelease(id) {
    const confirmed = window.confirm('Release this email to the real inbox?')
    if (!confirmed) return

    setActionId(id)
    setError('')

    try {
      const token = await getAccessToken()

      const response = await fetch(`${API_URL}/api/quarantine/${id}/release`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Release failed with status ${response.status}`)
      }

      setEmails((prev) => prev.filter((email) => email.id !== id))
    } catch (err) {
      console.error('Release failed:', err)
      setError('Could not release this email.')
    } finally {
      setActionId('')
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this quarantined email?')
    if (!confirmed) return

    setActionId(id)
    setError('')

    try {
      const token = await getAccessToken()

      const response = await fetch(`${API_URL}/api/quarantine/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`)
      }

      setEmails((prev) => prev.filter((email) => email.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Could not delete this email.')
    } finally {
      setActionId('')
    }
  }

  if (loading) {
    return <div className="table-empty">Loading quarantine…</div>
  }

  if (emails.length === 0) {
    return <div className="table-empty">No quarantined emails right now</div>
  }

  return (
    <div className="quarantine-wrap">
      {error && <div className="inline-error">{error}</div>}

      <div className="email-table-wrap">
        <table className="email-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Subject</th>
              <th>Verdict</th>
              <th>Score</th>
              <th>Time</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => {
              const busy = actionId === email.id

              return (
                <tr key={email.id}>
                  <td className="truncate-cell" title={email.from_address}>
                    {email.from_address || 'Unknown sender'}
                  </td>
                  <td className="truncate-cell" title={email.subject}>
                    {email.subject || '(No subject)'}
                  </td>
                  <td>
                    <VerdictBadge verdict={email.verdict} />
                  </td>
                  <td>
                    <span className="score-pill score-danger">{email.score ?? 0}</span>
                  </td>
                  <td>{new Date(email.received_at).toLocaleString()}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn-row-action"
                        onClick={() => onSelect?.(email)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-release"
                        disabled={busy}
                        onClick={() => handleRelease(email.id)}
                      >
                        {busy ? 'Working…' : 'Release'}
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        disabled={busy}
                        onClick={() => handleDelete(email.id)}
                      >
                        {busy ? 'Working…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}