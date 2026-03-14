// ═══════════════════════════════════════════════
// URL Scanner — Google Safe Browsing API
// Extracts all URLs from email body and checks
// against Google's threat database + heuristic patterns
// ═══════════════════════════════════════════════

import linkify from 'linkify-it'

// Suspicious URL patterns — typosquatting, fake paths, shorteners
const suspiciousPat = /login-|secure-|verify-|account-update|confirm-identity|update-account|paypa1|amaz0n|micros0ft|go0gle|netfl1x|bit\.ly|tinyurl\.com|t\.co|goo\.gl|\/verify|\/login|\/secure|\/update|\/confirm/i

export async function checkUrls(email) {
  // Step 1 — Extract all URLs from email text and HTML
  const lk = new linkify()
  const rawText = (email.text || '') + ' ' + (email.html || '')
  const matches = lk.match(rawText) || []

  // Step 2 — Decode URLs and filter out broken/malformed ones
  const urls = matches
    .map(m => {
      try {
        return decodeURIComponent(m.url)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  // Step 3 — No URLs found, return score 0
  if (!urls.length) {
    return { urlScore: 0, maliciousUrls: [] }
  }

  // Step 4 — Cap at 20 URLs max to avoid API rate limits
  const urlsToCheck = urls.slice(0, 20)

  // Step 5 — Run heuristic check (works even if API fails)
  const heuristicHits = urlsToCheck.filter(u => suspiciousPat.test(u))
  const heuristicScore = heuristicHits.length > 0 ? 30 : 0

  // Step 6 — Call Google Safe Browsing API
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
            threatEntries: urlsToCheck.map(u => ({ url: u })),
          },
        }),
      }
    )

    const data = await res.json()
    const found = data.matches || []

    return {
      urlScore:      found.length > 0 ? 80 : heuristicScore,
      maliciousUrls: found.map(m => m.threat.url),
    }

  } catch (err) {
    // API failed — fall back to heuristic only, never crash
    console.error('[checkUrls] Safe Browsing API error:', err)
    return {
      urlScore:      heuristicScore || 5,
      maliciousUrls: [],
    }
  }
}