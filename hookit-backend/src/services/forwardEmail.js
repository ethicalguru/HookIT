// ═══════════════════════════════════════════════
// Email Forwarding — Mailgun Outbound
// Forwards clean/released emails to user's real inbox
// with [✓ Verified] prefix and original sender info
// ═══════════════════════════════════════════════

import FormData from 'form-data'
import Mailgun  from 'mailgun.js'

const mg = new Mailgun(FormData).client({
  username: 'api',
  key: process.env.MG_KEY,
})

export async function forwardEmail(email) {
  try {
    await mg.messages.create(process.env.MG_DOMAIN, {
      from:    `HookIT <noreply@${process.env.MG_DOMAIN}>`,
      to:      [email.realEmail],
      subject: `[✓ Verified] ${email.subject}`,
      text:    email.text,
      html:    email.html,
      'h:Reply-To':          email.from,
      'h:X-Original-Sender': email.from,
      'h:X-HookIT':          'verified-clean',
    })
    console.log(`[forward] Sent to ${email.realEmail}: ${email.subject}`)
  } catch (err) {
    console.error('[forward] Mailgun send error:', err)
  }
}
