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
        <div style={{ padding: 40, color: '#e8ecf4', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
          <pre style={{ color: '#f59e0b', fontSize: 13, whiteSpace: 'pre-wrap', maxWidth: 600, margin: '16px auto' }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
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
          <svg viewBox="0 0 24 24" width="32" height="32" style={{ color: 'var(--accent-cyan)' }}>
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
