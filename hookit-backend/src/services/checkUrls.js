// ═══════════════════════════════════════════════
// URL Scanner — Google Safe Browsing API
// Extracts all URLs from email body and checks
// against Google's threat database + heuristic patterns
// ═══════════════════════════════════════════════

import linkify from 'linkify-it'

export async function checkUrls(email) {
  const lk = new linkify()
  const rawText = (email.text || '') + ' ' + (email.html || '')
  const matches = lk.match(rawText) || []
  const urls = matches.map(m => decodeURIComponent(m.url))

  if (!urls.length) {
    return { urlScore: 0, maliciousUrls: [] }
  }

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SB_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'hookit', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: urls.map(u => ({ url: u })),
          },
        }),
      }
    )

    const data = await res.json()
    const found = data.matches || []

    // Heuristic: suspicious URL patterns
    const suspiciousPat = /login-|secure-|verify-|account-update|paypa1|amaz0n/i
    const heuristic = urls.some(u => suspiciousPat.test(u)) ? 20 : 0

    return {
      urlScore:      found.length > 0 ? 80 : heuristic,
      maliciousUrls: found.map(m => m.threat.url),
    }
  } catch (err) {
    console.error('[checkUrls] Safe Browsing API error:', err)
    // Fallback to heuristic only
    const suspiciousPat = /login-|secure-|verify-|account-update|paypa1|amaz0n/i
    return {
      urlScore:      urls.some(u => suspiciousPat.test(u)) ? 30 : 5,
      maliciousUrls: [],
    }
  }
}
