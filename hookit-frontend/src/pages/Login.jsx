import { supabase } from '../supabaseClient'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.232 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.848 1.152 7.965 3.035l5.657-5.657C34.053 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.848 1.152 7.965 3.035l5.657-5.657C34.053 6.053 29.277 4 24 4c-7.682 0-14.35 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.146 35.091 26.672 36 24 36c-5.211 0-9.619-3.329-11.283-7.946l-6.522 5.025C9.5 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.793 2.24-2.231 4.166-4.094 5.57l.003-.002 6.19 5.238C36.97 39.196 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function ShieldLogo() {
  return (
    <div className="brand-block" aria-hidden="true">
      <div className="brand-mark">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            d="M12 2L20 5V11C20 16.25 16.72 20.94 12 22C7.28 20.94 4 16.25 4 11V5L12 2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 12L10.7 14.7L16.5 8.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="logo-text">HookIT</span>
    </div>
  )
}

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
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
        <ShieldLogo />

        <p className="login-kicker">Phishing detection for modern teams</p>
        <h1 className="login-title">Stop phishing before it starts</h1>
        <p className="login-subtitle">
          Protect your inbox with a secure email screening layer that detects
          suspicious messages before they land where they should not.
        </p>

        <button className="btn-google" onClick={handleGoogleLogin} type="button">
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <p className="login-footnote">
          Your emails are analyzed, never stored in plain text.
        </p>
      </div>
    </div>
  )
}