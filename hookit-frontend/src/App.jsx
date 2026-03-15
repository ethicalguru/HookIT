import { useEffect, useState, Component } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#1d1d1f', fontFamily: 'Inter, sans-serif', textAlign: 'center', background: '#f5f5f7', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#ff3b30', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ color: '#6e6e73', fontSize: 13, whiteSpace: 'pre-wrap', maxWidth: 500, margin: '0 auto 20px', background: '#f2f2f7', padding: 16, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', background: '#0071e3', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) console.error('Failed to get session:', error)
      setSession(data?.session ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="app-loader-screen">
        <div className="loader-brand">
          <svg viewBox="0 0 24 24" width="32" height="32" style={{ color: 'var(--accent)' }}>
            <path d="M12 2L20 5V11C20 16.25 16.72 20.94 12 22C7.28 20.94 4 16.25 4 11V5L12 2Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 12L10.7 14.7L16.5 8.9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="spinner" />
        <p className="app-loader-text">Initializing secure session…</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {session ? <Dashboard session={session} /> : <Login />}
    </ErrorBoundary>
  )
}

export default App
