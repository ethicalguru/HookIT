// ═══════════════════════════════════════════════
// Quarantine Inbox — list + release/delete actions
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase, API_URL } from '../supabaseClient'
import { VerdictBadge }      from './VerdictBadge'

export function QuarantineInbox({ session, onSelect, onUpdate }) {
  const [emails, setEmails]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('emails')
      .select('*')
      .eq('status', 'quarantined')
      .order('received_at', { ascending: false })
      .then(({ data }) => {
        setEmails(data || [])
        setLoading(false)
      })
  }, [])

  const apiCall = async (url, method) => {
    const { data: { session: s } } = await supabase.auth.getSession()
    return fetch(url, {
      method,
      headers: { Authorization: `Bearer ${s.access_token}` },
    })
  }

  const release = async (id) => {
    await apiCall(`${API_URL}/api/quarantine/${id}/release`, 'POST')
    setEmails(prev => prev.filter(e => e.id !== id))
  }

  const remove = async (id) => {
    await apiCall(`${API_URL}/api/quarantine/${id}`, 'DELETE')
    setEmails(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return <p>Loading quarantine...</p>

  if (!emails.length) {
    return <p className="table-empty">No quarantined emails — all clear! 🎉</p>
  }

  return (
    <div className="quarantine">
      {emails.map(email => (
        <div key={email.id} className="q-row">
          <VerdictBadge verdict={email.verdict} />
          <span className="q-score">{email.final_score}</span>
          <span className="q-from">{email.sender}</span>
          <span className="q-subject">{email.subject}</span>
          <div className="q-actions">
            <button onClick={() => onSelect(email)} className="btn-view">View</button>
            <button onClick={() => release(email.id)} className="btn-release">Release</button>
            <button onClick={() => remove(email.id)} className="btn-delete">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
