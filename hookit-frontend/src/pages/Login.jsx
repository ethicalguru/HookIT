import { supabase } from '../supabaseClient'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.232 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.848 1.152 7.965 3.035l5.657-5.657C34.053 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.848 1.152 7.965 3.035l5.657-5.657C34.053 6.053 29.277 4 24 4c-7.682 0-14.35 4.337-17.694 10.691z"/>
      <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.146 35.091 26.672 36 24 36c-5.211 0-9.619-3.329-11.283-7.946l-6.522 5.025C9.5 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.24-2.231 4.166-4.094 5.57l.003-.002 6.19 5.238C36.97 39.196 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}

function BrandLogo() {
  return (
    <div className="brand-block" style={{ justifyContent: 'center', marginBottom: 24 }}>
      <img src="/logo.svg" alt="HookIT" style={{ height: 56, width: 'auto' }} />
    </div>
  )
}

function FeatureIcon({ type }) {
  const icons = {
    layers: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    bolt: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    shield: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 3v6c0 5.25-3.28 9.94-8 11-4.72-1.06-8-5.75-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  }
  return (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: 8,
      background: 'var(--accent-light)', color: 'var(--accent)',
      flexShrink: 0,
    }}>
      {icons[type]}
    </span>
  )
}

function FeatureItem({ iconType, title, desc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      textAlign: 'left', padding: '10px 0',
    }}>
      <FeatureIcon type={iconType} />
      <div>
        <div style={{
          fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--text-primary)', marginBottom: '2px',
        }}>{title}</div>
        <div style={{
          fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.4,
        }}>{desc}</div>
      </div>
    </div>
  )
}

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      console.error('Google sign-in failed:', error)
      window.alert(error.message || 'Google sign-in failed.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-one" />
      <div className="login-bg-orb login-bg-orb-two" />

      <div className="login-card">
        <BrandLogo />

        <p className="login-kicker">AI-Powered Phishing Detection</p>
        <h1 className="login-title">
          Stop phishing<br />
          <span style={{ color: 'var(--accent)' }}>before it strikes</span>
        </h1>
        <p className="login-subtitle">
          Protect your inbox with an intelligent email screening layer that
          intercepts and analyzes suspicious messages in real-time.
        </p>

        <button className="btn-google" onClick={handleGoogleLogin} type="button">
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <div style={{
          marginTop: '28px', paddingTop: '20px',
          borderTop: '1px solid var(--border)',
        }}>
          <FeatureItem
            iconType="layers"
            title="3-Layer Analysis"
            desc="URL scanning, header verification, and AI content analysis"
          />
          <FeatureItem
            iconType="bolt"
            title="Real-Time Protection"
            desc="Emails screened and scored before reaching your inbox"
          />
          <FeatureItem
            iconType="shield"
            title="Auto-Quarantine"
            desc="High-risk emails isolated automatically for review"
          />
        </div>

        <p className="login-footnote">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Emails are analyzed, never stored in plain text
        </p>
      </div>
    </div>
  )
}
