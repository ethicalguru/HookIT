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

  // Step 1 — Run all 3 engines in parallel
  // Even if one fails, the others still run
  const [urlResult, headerResult, aiResult] = await Promise.all([
    checkUrls(email).catch(err => {
      console.error('[analyse] checkUrls failed:', err)
      return { urlScore: 5, maliciousUrls: [] }
    }),
    checkHeaders(email.rawHeaders).catch(err => {
      console.error('[analyse] checkHeaders failed:', err)
      return { headerScore: 60, spfPass: false, dkimPass: false, arcPass: false }
    }),
    claudeAnalyse(email).catch(err => {
      console.error('[analyse] claudeAnalyse failed:', err)
      return { aiScore: 25, reasons: ['Analysis unavailable'], urgencyFlag: false, impersonationTarget: null }
    }),
  ])

  // Step 2 — Weighted scoring formula
  // URL 35% + Header 25% + AI 40% = 100%
  const finalScore = Math.round(
    urlResult.urlScore       * 0.35 +
    headerResult.headerScore * 0.25 +
    aiResult.aiScore         * 0.40
  )

  // Step 3 — Final verdict based on score
  // < 45 = safe | 45-70 = suspicious | > 70 = phishing
  const verdict = finalScore >= 70 ? 'phishing'
                : finalScore >= 45 ? 'suspicious'
                : 'safe'

  const status = verdict === 'safe' ? 'safe' : 'quarantined'

  console.log(`[analyse] "${email.subject}" → ${verdict} (score: ${finalScore})`)
  console.log(`[analyse] URL: ${urlResult.urlScore} | Header: ${headerResult.headerScore} | AI: ${aiResult.aiScore}`)

  // Step 4 — Save result to database
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

  // Step 5 — Forward clean emails, quarantine everything else
  if (verdict === 'safe') {
    await forwardEmail(email)
    console.log(`[analyse] Email forwarded to ${email.realEmail}`)
  } else {
    console.log(`[analyse] Email quarantined — reason: ${verdict}`)
  }
}
