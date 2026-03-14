// ═══════════════════════════════════════════════
// Login Page — Google OAuth via Supabase
// ═══════════════════════════════════════════════

import { useState } from 'react'
import { supabase } from '../supabaseClient'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}

const FEATURES = [
  { icon: <ShieldIcon />, title: 'Real-Time Protection',  desc: 'Every email scanned before it reaches you' },
  { icon: <ScanIcon />,   title: '3-Engine Analysis',     desc: 'URL scanning, header checks & Claude AI' },
  { icon: <ZapIcon />,    title: 'Instant Dashboard',     desc: 'Live stats, charts & quarantine inbox' },
]

export default function Login() {
  const [signingIn, setSigningIn] = useState(false)

  const handleGoogleLogin = async () => {
    setSigningIn(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-card fade-in">
        <div className="login-logo">🪝</div>
        <h1>HookIT</h1>
        <p className="login-tagline">
          AI-powered email phishing detection.<br />
          Protect your inbox in real time.
        </p>

        <div className="login-features">
          {FEATURES.map(f => (
            <div key={f.title} className="login-feature">
              <span className="login-feature-icon">{f.icon}</span>
              <div>
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleGoogleLogin}
          className={`google-btn ${signingIn ? 'google-btn--loading' : ''}`}
          disabled={signingIn}
        >
          {signingIn ? (
            <>
              <span className="btn-spinner" />
              Redirecting…
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>
        <p className="login-footer">
          Your emails are analysed securely. We never store passwords.
        </p>
      </div>
    </div>
  )
}
