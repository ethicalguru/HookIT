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
          <img src="/logo.png" alt="HookIT" style={{ height: 40, width: 'auto' }} />
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
