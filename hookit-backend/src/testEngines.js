// ═══════════════════════════════════════════
// Quick test for all 3 engines
// ═══════════════════════════════════════════

import 'dotenv/config'

import { checkUrls }     from './services/checkUrls.js'
import { checkHeaders }  from './services/checkHeaders.js'
import { claudeAnalyse } from './services/claudeAnalyse.js'

const cleanEmail = {
  from:    'john@gmail.com',
  subject: 'Meeting tomorrow at 9am',
  text:    'Hey, just a reminder we have a meeting tomorrow at 9am. See you there!',
  html:    '',
}

const suspiciousEmail = {
  from:    'support@unknown-bank.net',
  subject: 'Your account has been limited',
  text:    'Your account has been limited. Please verify your information at http://bit.ly/verify-account',
  html:    '',
}

const phishingEmail = {
  from:    'PayPal Support <security@paypa1-secure.com>',
  subject: 'URGENT: Your PayPal account will be suspended',
  text:    'Dear Customer, your account has been compromised. Click here immediately to verify: http://paypa1-secure.com/login or your account will be closed in 24 hours.',
  html:    '',
}

const cleanHeaders = JSON.stringify([
  ['Authentication-Results', 'mx.google.com; spf=pass dkim=pass arc=pass'],
  ['From', 'john@gmail.com'],
])

const phishingHeaders = JSON.stringify([
  ['Authentication-Results', 'mx.google.com; spf=fail dkim=fail'],
  ['From', 'PayPal Support <security@paypa1-secure.com>'],
  ['Reply-To', 'collect@different-domain.com'],
])

async function runTests() {
  console.log('🧪 Running engine tests...\n')

  console.log('GEMINI KEY:', process.env.GEMINI_KEY)

  console.log('━━━ URL Scanner Tests ━━━')
  const urlClean = await checkUrls(cleanEmail)
  console.log('✅ Clean email URL score:', urlClean.urlScore, '(expected: 0-10)')

  const urlSuspicious = await checkUrls(suspiciousEmail)
  console.log('⚠️  Suspicious email URL score:', urlSuspicious.urlScore, '(expected: 20-40)')

  const urlPhishing = await checkUrls(phishingEmail)
  console.log('🚨 Phishing email URL score:', urlPhishing.urlScore, '(expected: 70+)')

  console.log('\n━━━ Header Checker Tests ━━━')
  const headerClean = checkHeaders(cleanHeaders)
  console.log('✅ Clean email header score:', headerClean.headerScore, '(expected: 0-20)')

  const headerPhishing = checkHeaders(phishingHeaders)
  console.log('🚨 Phishing email header score:', headerPhishing.headerScore, '(expected: 50+)')

  console.log('\n━━━ Claude AI Tests ━━━')
  const aiClean = await claudeAnalyse(cleanEmail)
  console.log('✅ Clean email AI score:', aiClean.aiScore, '(expected: 0-20)')
  console.log('   Reasons:', aiClean.reasons)

  const aiSuspicious = await claudeAnalyse(suspiciousEmail)
  console.log('⚠️  Suspicious email AI score:', aiSuspicious.aiScore, '(expected: 45-70)')
  console.log('   Reasons:', aiSuspicious.reasons)

  const aiPhishing = await claudeAnalyse(phishingEmail)
  console.log('🚨 Phishing email AI score:', aiPhishing.aiScore, '(expected: 70+)')
  console.log('   Urgency flag:', aiPhishing.urgencyFlag)
  console.log('   Impersonation target:', aiPhishing.impersonationTarget)

  console.log('\n✅ All tests complete!')
}

runTests()