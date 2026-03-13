// ═══════════════════════════════════════════════
// Analysis Engine — Orchestrator
// Runs 3 parallel checks, computes weighted score,
// stores result, and forwards or quarantines.
// ═══════════════════════════════════════════════

import { checkUrls }       from './checkUrls.js'
import { checkHeaders }    from './checkHeaders.js'
import { claudeAnalyse }   from './claudeAnalyse.js'
import { forwardEmail }    from './forwardEmail.js'
import { supabaseService } from '../lib/supabase.js'

export async function analyseEmail(email) {
  const [urlResult, headerResult, aiResult] = await Promise.all([
    checkUrls(email),
    checkHeaders(email.rawHeaders),
    claudeAnalyse(email),
  ])

  // Weighted scoring: URL 35% + Header 25% + AI 40%
  const finalScore = Math.round(
    urlResult.urlScore       * 0.35 +
    headerResult.headerScore * 0.25 +
    aiResult.aiScore         * 0.40
  )

  const verdict = finalScore >= 70 ? 'phishing'
                : finalScore >= 45 ? 'suspicious'
                : 'safe'

  const status = verdict === 'safe' ? 'safe' : 'quarantined'

  // Store in database
  const { error } = await supabaseService.from('emails').insert({
    user_id:              email.userId,
    sender:               email.from,
    recipient:            email.to,
    subject:              email.subject,
    body_text:            email.text?.slice(0, 5000),
    status,
    verdict,
    final_score:          finalScore,
    url_score:            urlResult.urlScore,
    header_score:         headerResult.headerScore,
    ai_score:             aiResult.aiScore,
    reasons:              aiResult.reasons,
    urgency_flag:         aiResult.urgencyFlag,
    impersonation_target: aiResult.impersonationTarget,
    spf_pass:             headerResult.spfPass,
    dkim_pass:            headerResult.dkimPass,
    malicious_urls:       urlResult.maliciousUrls,
  })

  if (error) {
    console.error('[analyse] DB insert error:', error)
    return
  }

  // Forward safe emails to user's real inbox
  if (verdict === 'safe') {
    await forwardEmail(email)
  }

  console.log(`[analyse] ${email.subject} → ${verdict} (score: ${finalScore})`)
}
