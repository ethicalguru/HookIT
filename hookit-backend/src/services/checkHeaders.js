// ═══════════════════════════════════════════════
// Header Check — SPF / DKIM / ARC / Spoof Detection
// Parses email authentication headers and detects
// display-name spoofing against known brands
// ═══════════════════════════════════════════════

export function checkHeaders(rawHeadersJson) {
  try {
    const headers = JSON.parse(rawHeadersJson || '[]')
    const get = (key) =>
      headers.find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1] ?? ''

    const authResult = get('Authentication-Results')
    const spfPass  = /spf=pass/i.test(authResult)
    const dkimPass = /dkim=pass/i.test(authResult)
    const arcPass  = /arc=pass/i.test(authResult)

    // Display name spoofing check
    const fromHeader = get('From')
    const nameMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/)
    let spoofed = false
    if (nameMatch) {
      const [, displayName, emailAddr] = nameMatch
      const domain = emailAddr.split('@')[1] || ''
      const brands = ['paypal', 'amazon', 'apple', 'microsoft', 'google', 'netflix', 'bank']
      spoofed = brands.some(
        b => displayName.toLowerCase().includes(b) && !domain.includes(b)
      )
    }

    let score = 0
    if (!spfPass)  score += 25
    if (!dkimPass) score += 25
    if (!arcPass)  score += 10
    if (spoofed)   score += 20

    return {
      headerScore: Math.min(score, 100),
      spfPass,
      dkimPass,
      arcPass,
    }
  } catch (err) {
    console.error('[checkHeaders] Parse error:', err)
    return { headerScore: 30, spfPass: false, dkimPass: false, arcPass: false }
  }
}
