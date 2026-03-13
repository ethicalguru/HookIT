// ═══════════════════════════════════════════════
// Claude AI — Content Analysis
// Sends email content to Claude for phishing detection
// Returns score, reasons, urgency flag, impersonation target
// ═══════════════════════════════════════════════

export async function claudeAnalyse(email) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':          process.env.CLAUDE_KEY,
        'anthropic-version':  '2023-06-01',
        'Content-Type':       'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: `You are a phishing email security analyst.
Return ONLY valid JSON, no markdown, no preamble:
{
  "score": <integer 0-100>,
  "verdict": "safe" | "suspicious" | "phishing",
  "reasons": ["concise reason 1", "reason 2"],
  "urgency_flag": <true|false>,
  "impersonation_target": "brand name or null"
}
Score guide: 0-44 safe, 45-70 suspicious, 71-100 phishing.`,
        messages: [{
          role: 'user',
          content: `From: ${email.from}\nSubject: ${email.subject}\nBody: ${email.text?.slice(0, 2000)}`,
        }],
      }),
    })

    const data = await res.json()
    const raw = data.content[0].text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(raw)

    return {
      aiScore:             parsed.score,
      reasons:             parsed.reasons,
      urgencyFlag:         parsed.urgency_flag,
      impersonationTarget: parsed.impersonation_target,
    }
  } catch (err) {
    console.error('[claudeAnalyse] Error:', err)
    // Fallback: neutral score so other engines still contribute
    return {
      aiScore:             25,
      reasons:             ['Claude analysis unavailable — defaulting to moderate'],
      urgencyFlag:         false,
      impersonationTarget: null,
    }
  }
}
