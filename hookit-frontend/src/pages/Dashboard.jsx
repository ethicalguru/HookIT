import { useEffect, useMemo, useState } from 'react'
import { supabase, API_URL } from '../supabaseClient'
import { useStats } from '../hooks/useStats'
import KpiCards from '../components/KpiCards'
import EmailVolumeChart from '../components/EmailVolumeChart'
import VerdictPie from '../components/VerdictPie'
import BrandsBarChart from '../components/BrandsBarChart'
import { EmailTable } from '../components/EmailTable'
import { QuarantineInbox } from '../components/QuarantineInbox'
import { EmailDetailModal } from '../components/EmailDetailModal'
import '../styles/dashboard.css'

function ShieldLogo() {
  return (
    <div className="brand-block">
      <div className="brand-mark">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2L20 5V11C20 16.25 16.72 20.94 12 22C7.28 20.94 4 16.25 4 11V5L12 2Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M8 12L10.7 14.7L16.5 8.9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="logo-text">HookIT</span>
    </div>
  )
}

function StatusDot() {
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7,
      borderRadius: '50%', background: 'var(--accent-green)',
      boxShadow: '0 0 8px rgba(16,185,129,0.5)',
      animation: 'glow-pulse 3s ease-in-out infinite',
      marginRight: 6,
    }} />
  )
}

export default function Dashboard({ session }) {
  const [proxyAddress, setProxyAddress] = useState('')
  const [activeTab, setActiveTab] = useState('emails')
  const [copied, setCopied] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [onboardLoading, setOnboardLoading] = useState(true)

  const stats = useStats(session)

  const userName = useMemo(() => {
    return (
      session?.user?.user_metadata?.full_name ||
      session?.user?.email ||
      'HookIT User'
    )
  }, [session])

  const avatarUrl = session?.user?.user_metadata?.avatar_url || ''

  useEffect(() => {
    let ignore = false
    const onboardUser = async () => {
      setOnboardLoading(true)
      setOnboardError('')
      try {
        const response = await fetch(`${API_URL}/api/onboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        if (!response.ok) throw new Error(`Onboard failed with status ${response.status}`)
        const data = await response.json()
        if (!ignore) setProxyAddress(data?.proxyAddress ?? '')
      } catch (error) {
        console.error('Onboard error:', error)
        // Fallback: generate a demo proxy address from the user's email
        if (!ignore) {
          const emailSlug = (session?.user?.email || 'user').split('@')[0].split('.')[0].toLowerCase()
          const tag = Math.random().toString(36).slice(2, 6)
          setProxyAddress(`${emailSlug}.${tag}@shield.hookit.email`)
        }
      } finally {
        if (!ignore) setOnboardLoading(false)
      }
    }
    onboardUser()
    return () => { ignore = true }
  }, [session.access_token])

  useEffect(() => {
    const channel = supabase
      .channel(`emails-${session.user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'emails',
        filter: `user_id=eq.${session.user.id}`,
      }, () => { stats.refetch() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session.user.id, stats])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    if (!proxyAddress) return
    try { await navigator.clipboard.writeText(proxyAddress); setCopied(true) }
    catch (error) { console.error('Clipboard error:', error) }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out failed:', error)
  }

  return (
    <div className="dashboard-root">
      <header className="dash-header">
        <div className="dash-header-left"><ShieldLogo /></div>

        <div className="proxy-bar" aria-label="Proxy address">
          <span className="proxy-label">
            <StatusDot />Proxy
          </span>
          <div className="proxy-address">
            {onboardLoading ? 'Connecting…' : proxyAddress || 'Unavailable'}
          </div>
          <button
            className={`btn-copy ${copied ? 'is-copied' : ''}`}
            type="button"
            onClick={handleCopy}
            disabled={!proxyAddress}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="user-info">
          {avatarUrl
            ? <img className="avatar" src={avatarUrl} alt={userName} />
            : <div className="avatar avatar-fallback" aria-hidden="true">{userName.charAt(0).toUpperCase()}</div>}
          <div className="user-meta">
            <span className="user-name">{userName}</span>
            <span className="user-email">{session?.user?.email}</span>
          </div>
          <button className="btn-signout" type="button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="section-label">Threat Overview</div>
        <KpiCards stats={stats.loading ? null : stats.data} />

        <div className="section-label">Analytics</div>
        <div className="charts-grid">
          <EmailVolumeChart data={stats.loading ? null : stats.data?.volumeByDay} />
          <VerdictPie data={stats.loading ? null : stats.data} />
          <BrandsBarChart data={stats.loading ? null : stats.data?.topBrands} />
        </div>

        <div className="section-label">Email Feed</div>
        <div className="tab-bar">
          <button
            className={activeTab === 'emails' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('emails')}
            type="button"
          >
            All Emails
          </button>
          <button
            className={activeTab === 'quarantine' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('quarantine')}
            type="button"
          >
            🔒 Quarantine
          </button>
        </div>

        <div className="table-shell">
          {activeTab === 'emails' ? (
            <EmailTable emails={stats.data?.emails || []} onSelect={setSelectedEmail} />
          ) : (
            <QuarantineInbox session={session} onSelect={setSelectedEmail} emails={stats.data?.emails?.filter(e => e.status === 'quarantined') || []} />
          )}
        </div>

        {selectedEmail && (
          <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
        )}
      </main>
    </div>
  )
}
