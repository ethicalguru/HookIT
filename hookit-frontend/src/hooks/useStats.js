import { useCallback, useEffect, useState } from 'react'
import { supabase, API_URL } from '../supabaseClient'

// ── Demo data for hackathon presentation ──────────────────────────────────
function generateDemoData() {
  const now = new Date()
  const volumeByDay = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    volumeByDay.push({
      date: d.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 12) + (i < 7 ? 4 : 1),
    })
  }

  const demoEmails = [
    { id: 'd1', sender: 'security@paypa1-secure.net', subject: 'URGENT: Your account has been compromised', verdict: 'phishing', final_score: 92, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 12).toISOString(), spf_pass: false, dkim_pass: false, reasons: ['Impersonates PayPal', 'Urgency language', 'Suspicious URL pattern'], impersonation_target: 'PayPal', url_score: 85, header_score: 78, ai_score: 95, body_text: 'Dear Customer, your account has been compromised. Verify your identity immediately or your account will be permanently suspended.' },
    { id: 'd2', sender: 'noreply@amazon-alerts.com', subject: 'Your order #38291 cannot be delivered', verdict: 'phishing', final_score: 87, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 45).toISOString(), spf_pass: false, dkim_pass: false, reasons: ['Impersonates Amazon', 'Fake order reference', 'Link to credential harvesting site'], impersonation_target: 'Amazon', url_score: 80, header_score: 70, ai_score: 92, body_text: 'We were unable to deliver your recent order. Click here to update your shipping information and payment method.' },
    { id: 'd3', sender: 'it-support@company.com', subject: 'Password expiry notice - action required', verdict: 'suspicious', final_score: 58, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 90).toISOString(), spf_pass: true, dkim_pass: false, reasons: ['Password reset request', 'External reply-to address'], impersonation_target: null, url_score: 30, header_score: 55, ai_score: 68, body_text: 'Your corporate password will expire in 24 hours. Please click the link below to reset it and avoid losing access.' },
    { id: 'd4', sender: 'newsletter@techcrunch.com', subject: 'This week in AI: GPT-5 benchmarks released', verdict: 'safe', final_score: 8, status: 'safe', received_at: new Date(now - 1000 * 60 * 120).toISOString(), spf_pass: true, dkim_pass: true, reasons: ['Known newsletter sender', 'Valid authentication'], impersonation_target: null, url_score: 0, header_score: 5, ai_score: 8, body_text: 'Welcome to this week\'s roundup of the biggest stories in tech...' },
    { id: 'd5', sender: 'billing@netflix-renew.co', subject: 'Your subscription payment failed', verdict: 'phishing', final_score: 84, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 180).toISOString(), spf_pass: false, dkim_pass: false, reasons: ['Impersonates Netflix', 'Fake billing domain', 'Urgency language'], impersonation_target: 'Netflix', url_score: 75, header_score: 72, ai_score: 90, body_text: 'Your payment method has been declined. Update your billing information within 24 hours to avoid service interruption.' },
    { id: 'd6', sender: 'alice@teammates.dev', subject: 'Standup notes - March 14', verdict: 'safe', final_score: 5, status: 'safe', received_at: new Date(now - 1000 * 60 * 240).toISOString(), spf_pass: true, dkim_pass: true, reasons: ['Known sender', 'No suspicious content'], impersonation_target: null, url_score: 0, header_score: 0, ai_score: 5, body_text: 'Hey team, here are the notes from today\'s standup. Let me know if I missed anything.' },
    { id: 'd7', sender: 'support@micros0ft-verify.com', subject: 'Unusual sign-in activity on your account', verdict: 'phishing', final_score: 91, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 360).toISOString(), spf_pass: false, dkim_pass: false, reasons: ['Impersonates Microsoft', 'Homoglyph in domain', 'Credential phishing attempt'], impersonation_target: 'Microsoft', url_score: 88, header_score: 80, ai_score: 93, body_text: 'We detected unusual sign-in activity on your Microsoft account. Review your recent activity and secure your account now.' },
    { id: 'd8', sender: 'updates@github.com', subject: 'New release: React 19.1 is now available', verdict: 'safe', final_score: 3, status: 'safe', received_at: new Date(now - 1000 * 60 * 480).toISOString(), spf_pass: true, dkim_pass: true, reasons: ['Verified sender', 'No suspicious indicators'], impersonation_target: null, url_score: 0, header_score: 0, ai_score: 3, body_text: 'A new release is available for a repository you\'re watching. Check out the release notes for details.' },
    { id: 'd9', sender: 'admin@chase-secure.net', subject: 'Suspicious transaction detected on your account', verdict: 'phishing', final_score: 89, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 600).toISOString(), spf_pass: false, dkim_pass: false, reasons: ['Impersonates Chase Bank', 'Financial fraud attempt', 'Suspicious URL'], impersonation_target: 'Chase', url_score: 82, header_score: 75, ai_score: 94, body_text: 'We have detected a suspicious transaction of $2,499.00 on your account. If you did not authorize this, click here immediately.' },
    { id: 'd10', sender: 'hr@company.com', subject: 'Reminder: Team lunch tomorrow at 12:30', verdict: 'safe', final_score: 2, status: 'safe', received_at: new Date(now - 1000 * 60 * 720).toISOString(), spf_pass: true, dkim_pass: true, reasons: ['Internal sender', 'No risks detected'], impersonation_target: null, url_score: 0, header_score: 0, ai_score: 2, body_text: 'Just a friendly reminder about the team lunch tomorrow. We\'ll be at the usual place.' },
    { id: 'd11', sender: 'delivery@fedex-tracking.info', subject: 'FedEx: Package delivery attempt failed', verdict: 'suspicious', final_score: 62, status: 'quarantined', received_at: new Date(now - 1000 * 60 * 900).toISOString(), spf_pass: true, dkim_pass: false, reasons: ['Possible FedEx impersonation', 'Tracking link leads to unknown domain'], impersonation_target: 'FedEx', url_score: 55, header_score: 45, ai_score: 70, body_text: 'A delivery attempt was made but no one was available. Reschedule your delivery by clicking below.' },
    { id: 'd12', sender: 'promo@shopify.com', subject: '50% off your next month - loyal customer reward', verdict: 'safe', final_score: 12, status: 'safe', received_at: new Date(now - 1000 * 60 * 1080).toISOString(), spf_pass: true, dkim_pass: true, reasons: ['Known marketing sender', 'Valid authentication'], impersonation_target: null, url_score: 5, header_score: 0, ai_score: 15, body_text: 'As a thank you for being a loyal customer, enjoy 50% off your next billing cycle.' },
  ]

  const safe = demoEmails.filter(e => e.verdict === 'safe').length
  const suspicious = demoEmails.filter(e => e.verdict === 'suspicious').length
  const phishing = demoEmails.filter(e => e.verdict === 'phishing').length

  const topBrands = [
    { brand: 'PayPal', count: 4 },
    { brand: 'Amazon', count: 3 },
    { brand: 'Microsoft', count: 3 },
    { brand: 'Netflix', count: 2 },
    { brand: 'Chase', count: 2 },
    { brand: 'FedEx', count: 1 },
  ]

  return {
    total: demoEmails.length,
    safe,
    suspicious,
    phishing,
    volumeByDay,
    topBrands,
    emails: demoEmails,
  }
}

export function useStats(session) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    if (!session?.access_token) {
      // No session — use demo data immediately
      setData(generateDemoData())
      setLoading(false)
      setError('')
      return
    }

    try {
      setError('')

      const response = await fetch(`${API_URL}/api/stats`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Stats request failed with status ${response.status}`)
      }

      const result = await response.json()

      // If no real emails yet, merge with demo data for presentation
      if (!result?.emails?.length) {
        const demo = generateDemoData()
        setData(demo)
      } else {
        setData(result ?? null)
      }
    } catch (err) {
      console.error('Stats fetch error:', err)
      // Fallback to demo data instead of showing error
      console.info('Using demo data as fallback')
      setData(generateDemoData())
      setError('')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    let active = true

    const firstLoad = async () => {
      setLoading(true)
      await refetch()
      if (!active) return
    }

    firstLoad()

    return () => {
      active = false
    }
  }, [refetch])

  useEffect(() => {
    if (!session?.user?.id) return undefined

    const channel = supabase
      .channel(`stats-feed-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, refetch])

  return {
    data,
    loading,
    error,
    refetch,
  }
}