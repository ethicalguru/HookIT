// ═══════════════════════════════════════════════
// App.jsx — Auth Gate
// Shows Login if no session, Dashboard if authenticated
// ═══════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [session, setSession]   = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading HookIT...</p>
      </div>
    )
  }

  return session ? <Dashboard session={session} /> : <Login />
}
