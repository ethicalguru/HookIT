// ═══════════════════════════════════════════════
// Claude AI — Content Analysis
// Sends email content to Claude for phishing detection
// Returns score, reasons, urgency flag, impersonation target
// ═══════════════════════════════════════════════

// Helper — extract JSON even if Claude adds preamble text
function extractJson(text) {
  // Strip markdown code fences if present
  const stripped = text.replace(/```json|```/g, '').trim()
  // Find the first { and last } to extract just the JSON object
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found in response')
  return stripped.slice(start, end + 1)
}

// Helper — clamp score between 0 and 100
function clamp(score) {
  return Math.min(100, Math.max(0, Math.round(score)))
}

export async function claudeAnalyse(email) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 512,

        system: `You are an expert email phishing detection system.
Analyse the email and return ONLY a valid JSON object — no markdown, no explanation, no preamble.

Scoring guide:
- 0-20:  Clearly legitimate (work email, personal message, known newsletter)
- 21-44: Low risk (minor suspicion but likely safe)
- 45-70: Suspicious (some red flags, proceed with caution)
- 71-100: Phishing (clear malicious intent, impersonation, or fraud attempt)

Red flags to look for:
- Urgency language: "act now", "account suspended", "verify immediately"
- Threats: "your account will be closed", "legal action", "unauthorized access"
- Impersonation: claims to be a bank, PayPal, Amazon, Apple, Google, Microsoft etc.
- Requests for: passwords, credit cards, SSN, personal information
- Suspicious links or attachments mentioned in body
- Generic greetings: "Dear Customer", "Dear User"
- Poor grammar or spelling mistakes

Return ONLY this JSON format:
{
  "score": <integer 0-100>,
  "verdict": "safe" | "suspicious" | "phishing",
  "reasons": ["concise reason 1", "reason 2", "reason 3"],
  "urgency_flag": <true|false>,
  "impersonation_target": "<brand name or null>"
}`,

        messages: [{
          role:    'user',
          content: `Analyse this email for phishing:

From: ${email.from}
Subject: ${email.subject}
Body:
${email.text?.slice(0, 2000) || '(no body)'}`,
        }],
      }),
    })

    const data = await res.json()

    // Guard — check API returned content
    if (!data.content || !data.content[0]?.text) {
      throw new Error('Empty response from Claude API')
    }

    const raw    = extractJson(data.content[0].text)
    const parsed = JSON.parse(raw)

    // Clamp score just in case Claude returns something out of range
    const score = clamp(parsed.score ?? 25)

    return {
      aiScore:             score,
      reasons:             parsed.reasons             || ['No reasons provided'],
      urgencyFlag:         parsed.urgency_flag        ?? false,
      impersonationTarget: parsed.impersonation_target ?? null,
    }

  } catch (err) {
    // Never crash — return a safe fallback score
    console.error('[claudeAnalyse] Error:', err)
    return {
      aiScore:             25,
      reasons:             ['Claude analysis unavailable — defaulting to moderate'],
      urgencyFlag:         false,
      impersonationTarget: null,
    }
  }
}