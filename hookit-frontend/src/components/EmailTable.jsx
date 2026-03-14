// EmailTable.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { VerdictBadge } from './VerdictBadge'

function formatRelativeTime(dateString) {
  if (!dateString) return '—'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < minute) return 'Just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`

  return date.toLocaleDateString()
}

function getScoreClass(score = 0) {
  if (score <= 44) return 'score-safe'
  if (score <= 70) return 'score-warning'
  return 'score-danger'
}

export function EmailTable({ onSelect }) {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('received_at')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    let mounted = true

    async function loadEmails() {
      setLoading(true)

      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(200)

      if (!mounted) return

      if (error) {
        console.error('Failed to load emails:', error)
        setEmails([])
      } else {
        setEmails(data || [])
      }

      setLoading(false)
    }

    loadEmails()

    return () => {
      mounted = false
    }
  }, [])

  const sortedEmails = useMemo(() => {
    const copy = [...emails]

    copy.sort((a, b) => {
      let left = a[sortBy]
      let right = b[sortBy]

      if (sortBy === 'received_at') {
        left = new Date(left || 0).getTime()
        right = new Date(right || 0).getTime()
      }

      if (sortBy === 'verdict') {
        left = String(left || '')
        right = String(right || '')
      }

      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return copy
  }, [emails, sortBy, sortDir])

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir(column === 'received_at' ? 'desc' : 'asc')
    }
  }

  if (loading) {
    return <div className="table-empty">Loading emails…</div>
  }

  if (sortedEmails.length === 0) {
    return <div className="table-empty">No emails analysed yet</div>
  }

  return (
    <div className="email-table-wrap">
      <table className="email-table">
        <thead>
          <tr>
            <th>
              <button type="button" className="th-btn" onClick={() => toggleSort('from_address')}>
                Sender
              </button>
            </th>
            <th>Subject</th>
            <th>
              <button type="button" className="th-btn" onClick={() => toggleSort('verdict')}>
                Verdict
              </button>
            </th>
            <th>
              <button type="button" className="th-btn" onClick={() => toggleSort('score')}>
                Score
              </button>
            </th>
            <th>
              <button type="button" className="th-btn" onClick={() => toggleSort('received_at')}>
                Time
              </button>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sortedEmails.map((email) => (
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
                <span className={`score-pill ${getScoreClass(email.score)}`}>
                  {email.score ?? 0}
                </span>
              </td>
              <td>{formatRelativeTime(email.received_at)}</td>
              <td>
                <button
                  type="button"
                  className="btn-row-action"
                  onClick={() => onSelect?.(email)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}