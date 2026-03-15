// ═══════════════════════════════════════════════
// Gemini AI — Content Analysis
// Sends email content to Gemini for phishing detection
// Returns score, reasons, urgency flag, impersonation target
// ═══════════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai'

// Helper — extract JSON even if Gemini adds preamble text
function extractJson(text) {
  const stripped = text.replace(/```json|```/g, '').trim()
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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an expert email phishing detection system.
Analyse the email below and return ONLY a valid JSON object — no markdown, no explanation, no preamble.

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
- Generic greetings: "Dear Customer", "Dear User"
- Poor grammar or spelling mistakes

Return ONLY this JSON format:
{
  "score": <integer 0-100>,
  "verdict": "safe" | "suspicious" | "phishing",
  "reasons": ["concise reason 1", "reason 2", "reason 3"],
  "urgency_flag": <true|false>,
  "impersonation_target": "<brand name or null>"
}

Email to analyse:
From: ${email.from}
Subject: ${email.subject}
Body:
${email.text?.slice(0, 2000) || '(no body)'}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const raw = extractJson(text)
    const parsed = JSON.parse(raw)

    const score = clamp(parsed.score ?? 25)

    return {
      aiScore:             score,
      reasons:             parsed.reasons              || ['No reasons provided'],
      urgencyFlag:         parsed.urgency_flag         ?? false,
      impersonationTarget: parsed.impersonation_target ?? null,
    }

  } catch (err) {
    // Never crash — return a safe fallback score
    console.error('[claudeAnalyse] Error:', err)
    return {
      aiScore:             25,
      reasons:             ['AI analysis unavailable — defaulting to moderate'],
      urgencyFlag:         false,
      impersonationTarget: null,
    }
  }
}