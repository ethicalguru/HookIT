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
  const [proxyLoading, setProxyLoading] = useState(true)
  const [proxyError, setProxyError]     = useState(false)
  const [emails, setEmails]             = useState([])
  const [emailsLoading, setEmailsLoading] = useState(true)
  const [activeTab, setActiveTab]       = useState('all')   // 'all' | 'quarantine'
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [stats, setStats]               = useStats()
  const [copied, setCopied]             = useState(false)

  const user = session.user
  const quarantineCount = emails.filter(e => e.status === 'quarantined').length

  // ── Onboard: get or create proxy address ────
  useEffect(() => {
    async function onboard() {
      try {
        const res = await fetch(`${API_URL}/api/onboard`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const data = await res.json()
        if (data.proxy_address) setProxyAddress(data.proxy_address)
        else setProxyError(true)
      } catch {
        setProxyError(true)
      } finally {
        setProxyLoading(false)
      }
    }
    onboard()
  }, [session])

  // ── Load all emails ─────────────────────────
  useEffect(() => {
    supabase
      .from('emails')
      .select('*')
      .order('received_at', { ascending: false })
      .then(({ data }) => {
        setEmails(data || [])
        setEmailsLoading(false)
      })
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
    <div className="dashboard fade-in">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-brand">
          <span className="logo">🪝</span>
          <h1>HookIT</h1>
          <span className="dash-badge">Dashboard</span>
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
        <span className="proxy-label">📬 Your proxy address:</span>
        {proxyLoading ? (
          <span className="proxy-loading">
            <span className="btn-spinner" /> Generating…
          </span>
        ) : proxyError ? (
          <span className="proxy-error">Could not load proxy address — check backend</span>
        ) : (
          <>
            <code className="proxy-address">{proxyAddress}</code>
            <button onClick={copyProxy} className={`btn-copy ${copied ? 'btn-copy--success' : ''}`}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </>
        )}
      </div>

      {/* KPI Cards */}
      <section className="dash-section">
        <h2 className="section-title">Overview</h2>
        <KpiCards stats={stats} />
      </section>

      {/* Charts row */}
      <section className="dash-section">
        <h2 className="section-title">Analytics</h2>
        <div className="charts-row">
          <div className="chart-card">
            <h3>📈 Email Volume (30 days)</h3>
            <EmailVolumeChart emails={emails} />
          </div>
          <div className="chart-card">
            <h3>🎯 Threat Breakdown</h3>
            <VerdictPie emails={emails} />
          </div>
        </div>
      </section>

      {/* Brands chart */}
      <div className="chart-card full-width">
        <h3>🏢 Top Impersonated Brands</h3>
        <BrandsBarChart emails={emails} />
      </div>

      {/* Tab switcher */}
      <section className="dash-section">
        <h2 className="section-title">Email Inbox</h2>
        <div className="tab-bar">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Emails
            {emails.length > 0 && <span className="tab-count">{emails.length}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'quarantine' ? 'active' : ''}`}
            onClick={() => setActiveTab('quarantine')}
          >
            🔒 Quarantine
            {quarantineCount > 0 && <span className="tab-count tab-count--warn">{quarantineCount}</span>}
          </button>
        </div>
      </section>

      {/* Email list / Quarantine */}
      {emailsLoading ? (
        <div className="table-empty">
          <span className="btn-spinner" /> Loading emails…
        </div>
      ) : activeTab === 'all' ? (
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
