import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

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

  return session ? <Dashboard session={session} /> : <Login />
}

export default App
