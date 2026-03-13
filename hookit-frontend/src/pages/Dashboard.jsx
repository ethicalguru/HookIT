// ═══════════════════════════════════════════════
// Dashboard Page — Main layout with all panels
// KPIs, Charts, Email table, Quarantine, Realtime
// ═══════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { supabase, API_URL }  from '../supabaseClient'
import { useStats }            from '../hooks/useStats'
import { KpiCards }            from '../components/KpiCards'
import { EmailVolumeChart }    from '../components/EmailVolumeChart'
import { VerdictPie }          from '../components/VerdictPie'
import { BrandsBarChart }      from '../components/BrandsBarChart'
import { EmailTable }          from '../components/EmailTable'
import { QuarantineInbox }     from '../components/QuarantineInbox'
import { EmailDetailModal }    from '../components/EmailDetailModal'
import '../styles/dashboard.css'

export default function Dashboard({ session }) {
  const [proxyAddress, setProxyAddress] = useState('')
  const [emails, setEmails]     = useState([])
  const [activeTab, setActiveTab] = useState('all')   // 'all' | 'quarantine'
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [stats, setStats]       = useStats()
  const [copied, setCopied]     = useState(false)

  const user = session.user

  // ── Onboard: get or create proxy address ────
  useEffect(() => {
    async function onboard() {
      const res = await fetch(`${API_URL}/api/onboard`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.proxy_address) setProxyAddress(data.proxy_address)
    }
    onboard()
  }, [session])

  // ── Load all emails ─────────────────────────
  useEffect(() => {
    supabase
      .from('emails')
      .select('*')
      .order('received_at', { ascending: false })
      .then(({ data }) => setEmails(data || []))
  }, [])

  // ── Realtime subscription ───────────────────
  useEffect(() => {
    const channel = supabase
      .channel('my-email-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setEmails(prev => [payload.new, ...prev].slice(0, 200))
        setStats(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          blocked: payload.new.verdict !== 'safe' ? prev.blocked + 1 : prev.blocked,
        } : prev)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user.id])

  // ── Copy proxy address ──────────────────────
  const copyProxy = () => {
    navigator.clipboard.writeText(proxyAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Sign out ────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-brand">
          <span className="logo">🪝</span>
          <h1>HookIT</h1>
        </div>
        <div className="dash-user">
          <img
            src={user.user_metadata?.avatar_url}
            alt=""
            className="avatar"
          />
          <span className="user-name">{user.user_metadata?.full_name || user.email}</span>
          <button onClick={handleSignOut} className="btn-signout">Sign out</button>
        </div>
      </header>

      {/* Proxy address bar */}
      <div className="proxy-bar">
        <span>Your proxy address:</span>
        <code className="proxy-address">{proxyAddress || 'Loading...'}</code>
        <button onClick={copyProxy} className="btn-copy">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* KPI Cards */}
      <KpiCards stats={stats} />

      {/* Charts row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Email Volume (30 days)</h3>
          <EmailVolumeChart emails={emails} />
        </div>
        <div className="chart-card">
          <h3>Threat Breakdown</h3>
          <VerdictPie emails={emails} />
        </div>
      </div>

      {/* Brands chart */}
      <div className="chart-card full-width">
        <h3>Top Impersonated Brands</h3>
        <BrandsBarChart emails={emails} />
      </div>

      {/* Tab switcher */}
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Emails
        </button>
        <button
          className={`tab ${activeTab === 'quarantine' ? 'active' : ''}`}
          onClick={() => setActiveTab('quarantine')}
        >
          Quarantine
        </button>
      </div>

      {/* Email list / Quarantine */}
      {activeTab === 'all' ? (
        <EmailTable emails={emails} onSelect={setSelectedEmail} />
      ) : (
        <QuarantineInbox
          session={session}
          onSelect={setSelectedEmail}
          onUpdate={(updatedEmails) => setEmails(prev =>
            prev.map(e => updatedEmails.find(u => u.id === e.id) || e)
          )}
        />
      )}

      {/* Detail modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  )
}
