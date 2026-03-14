// ═══════════════════════════════════════════════
// Header Check — SPF / DKIM / ARC / Spoof Detection
// Parses email authentication headers and detects
// display-name spoofing against known brands
// ═══════════════════════════════════════════════

// Known brands that phishers commonly impersonate
const BRANDS = [
  'paypal', 'amazon', 'apple', 'microsoft', 'google', 'netflix',
  'chase', 'wellsfargo', 'citibank', 'bankofamerica', 'barclays',
  'fedex', 'ups', 'dhl', 'usps',
  'irs', 'hmrc', 'instagram', 'facebook', 'twitter', 'linkedin',
  'dropbox', 'docusign', 'zoom', 'spotify'
]

// Detect Unicode homoglyphs — e.g. Cyrillic 'а' instead of Latin 'a'
function hasHomoglyph(text) {
  return /[^\u0000-\u007F]/.test(text)
}

// Normalise headers — handles both array and JSON string input
function parseHeaders(rawHeadersJson) {
  if (Array.isArray(rawHeadersJson)) return rawHeadersJson
  if (!rawHeadersJson) return []
  try {
    return JSON.parse(rawHeadersJson)
  } catch {
    return []
  }
}

export function checkHeaders(rawHeadersJson) {
  try {
    const headers = parseHeaders(rawHeadersJson)

    // Helper to find a header value by key
    const get = (key) =>
      headers.find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1] ?? ''

    // Step 1 — Check SPF, DKIM, ARC authentication results
    const authResult = get('Authentication-Results')
    const spfPass  = /spf=pass/i.test(authResult)
    const dkimPass = /dkim=pass/i.test(authResult)
    const arcPass  = /arc=pass/i.test(authResult)

    // Step 2 — Check for display name spoofing
    // e.g. "PayPal Support" <random123@gmail.com>
    const fromHeader = get('From')
    const nameMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/)
    let spoofed = false
    let homoglyph = false

    if (nameMatch) {
      const [, displayName, emailAddr] = nameMatch
      const domain = emailAddr.split('@')[1] || ''
      const cleanName = displayName.toLowerCase().replace(/\s/g, '')

      // Check if display name contains a brand but domain doesn't match
      spoofed = BRANDS.some(
        b => cleanName.includes(b) && !domain.includes(b)
      )

      // Check for Unicode homoglyph tricks in display name
      homoglyph = hasHomoglyph(displayName)
    }

    // Step 3 — Check Reply-To mismatch
    // Phishers set Reply-To to a different domain to intercept replies
    const replyTo = get('Reply-To')
    let replyToMismatch = false
    if (replyTo && fromHeader) {
      const fromDomain  = fromHeader.match(/@([\w.-]+)/)?.[1] || ''
      const replyDomain = replyTo.match(/@([\w.-]+)/)?.[1] || ''
      replyToMismatch = fromDomain && replyDomain && fromDomain !== replyDomain
    }

    // Step 4 — Build score
    // Missing auth headers = suspicious, spoofing = very suspicious
    let score = 0
    if (!spfPass)          score += 25
    if (!dkimPass)         score += 25
    if (!arcPass)          score += 10
    if (spoofed)           score += 20
    if (homoglyph)         score += 15
    if (replyToMismatch)   score += 15

    return {
      headerScore:      Math.min(score, 100),
      spfPass,
      dkimPass,
      arcPass,
      spoofed,
      replyToMismatch,
    }

  } catch (err) {
    // Never crash — return a mid-range fallback score
    console.error('[checkHeaders] Parse error:', err)
    return {
      headerScore:    60,
      spfPass:        false,
      dkimPass:       false,
      arcPass:        false,
      spoofed:        false,
      replyToMismatch: false,
    }
  }
}