# ═══════════════════════════════════════════════════════════════════════
# TODO — Person B: Analysis Engines + Email Processing
# ═══════════════════════════════════════════════════════════════════════
# Owner: Person B
# Focus: Fine-tuning the 3 analysis engines, scoring logic, edge cases
# Files: hookit-backend/src/services/checkUrls.js, checkHeaders.js,
#         claudeAnalyse.js, analyseEmail.js
# ═══════════════════════════════════════════════════════════════════════


## Context
You own the analysis intelligence — the three engines that decide whether
an email is safe, suspicious, or phishing. The skeleton code is already
written in hookit-backend/src/services/. Your job is to test, harden,
and fine-tune each engine so the scoring is accurate and reliable.

The three engines run in parallel via Promise.all:
  1. URL Scanner    (Google Safe Browsing API)  → 0-100 score, 35% weight
  2. Header Check   (SPF/DKIM/ARC parsing)      → 0-100 score, 25% weight
  3. Claude AI      (content + tone analysis)    → 0-100 score, 40% weight

Final score = URL×0.35 + Header×0.25 + AI×0.40
  < 45 → safe  |  45-70 → suspicious  |  > 70 → phishing


## Getting Started
1. cd hookit-backend
2. Get .env from Person A (you need CLAUDE_KEY, GOOGLE_SB_KEY, SUPABASE_URL, SUPABASE_KEY)
3. npm install
4. npm run dev


## DAY 1 — Engine Development  (Target: ~8 hours)

### URL Scanner — checkUrls.js [0:00 – 2:30]
- [ ] Read and understand src/services/checkUrls.js
- [ ] Test Google Safe Browsing API with known-bad URLs (use Google's test URL:
      https://testsafebrowsing.appspot.com/s/phishing.html)
- [ ] Test with clean URLs (https://google.com) — should return score 0
- [ ] Improve the heuristic regex pattern — add more phishing patterns:
      - Typosquatting: paypa1, amaz0n, micros0ft, go0gle, netfl1x
      - Suspicious paths: /verify, /login, /secure, /update-account, /confirm-identity
      - URL shorteners: bit.ly, tinyurl, t.co (suspicious in formal emails)
- [ ] Handle edge cases:
      - Email with 0 URLs → score 0
      - Email with 50+ URLs → cap the Safe Browsing request to first 20
      - Malformed URLs → skip, don't crash
      - API rate limit / timeout → fallback to heuristic only
- [ ] Write a quick test: create a test-urls.js that calls checkUrls with sample data

### Header Check — checkHeaders.js [2:30 – 4:30]
- [ ] Read and understand src/services/checkHeaders.js
- [ ] Test with various Authentication-Results header formats:
      - Gmail format: "mx.google.com; spf=pass; dkim=pass"
      - Outlook format: "spf=pass (sender IP is ...) smtp.mailfrom=..."
      - Missing headers entirely → should return high score (60+)
- [ ] Improve brand spoofing detection:
      - Add more brands: chase, wells fargo, citibank, fedex, ups, dhl, irs, hmrc
      - Check for Unicode homoglyphs in display names (e.g. "Pаypal" with Cyrillic 'а')
- [ ] Add check for Reply-To mismatch (From domain ≠ Reply-To domain)
- [ ] Handle edge cases:
      - rawHeaders is null/undefined/empty string → graceful fallback
      - rawHeaders is already an array vs a JSON string → handle both

### Claude AI — claudeAnalyse.js [4:30 – 6:30]
- [ ] Read and understand src/services/claudeAnalyse.js
- [ ] Test with 3 sample emails:
      1. Clean: "Meeting tomorrow at 9am" from a normal address
      2. Suspicious: "Account limited" from unknown sender with link
      3. Phishing: "PayPal" display name from gmail.com, urgency language
- [ ] Verify Claude returns valid JSON every time — handle edge cases:
      - Claude wraps in ```json → strip markdown fences (already handled, verify)
      - Claude adds preamble text → extract JSON from response
      - Claude returns score outside 0-100 → clamp it
      - API timeout → return fallback score
- [ ] Fine-tune the system prompt if Claude's scores are too lenient/strict
- [ ] Test that urgency_flag and impersonation_target are detected correctly

### Scoring Calibration [6:30 – 7:30]
- [ ] Review the weighted formula in analyseEmail.js
- [ ] Test with these expected outcomes:
      | Scenario                          | Expected final | Expected verdict |
      |----------------------------------|----------------|------------------|
      | Clean email, no links            |     0-10       |  safe            |
      | Newsletter with links to legit   |    10-25       |  safe            |
      | SPF fail + suspicious URL        |    45-60       |  suspicious      |
      | Spoofed brand + urgency + bad URL|    70-95       |  phishing        |
- [ ] Adjust weights if scoring feels off (current: URL 0.35, Header 0.25, AI 0.40)
- [ ] Ensure the 3 demo emails (clean, phishing, release) produce good scores

### Error Resilience [7:30 – 8:00]
- [ ] Each engine should NEVER throw — always return a fallback score
- [ ] If one engine fails, the other two should still produce a usable result
- [ ] Log errors clearly with [checkUrls], [checkHeaders], [claudeAnalyse] prefixes


## DAY 2 — Polish & Demo Prep

- [ ] Create seed data script: generate 15-20 realistic email analysis rows
      (different senders, subjects, scores, dates) for Person C's dashboard charts
- [ ] Test with Person A's full pipeline end-to-end
- [ ] Fine-tune scoring after seeing real test results
- [ ] Help Person D with any score display issues in the modal
- [ ] Prepare 3 demo emails that produce reliable, impressive results:
      1. 🟢 Clean: score ~5, all checks pass
      2. 🔴 Phishing: score 80+, SPF fail, bad URL, urgency language
      3. 🔵 Release test: use email #2, release from quarantine


## Key Files You Own
- hookit-backend/src/services/checkUrls.js      — URL scanning logic
- hookit-backend/src/services/checkHeaders.js    — Header parsing + spoof detection
- hookit-backend/src/services/claudeAnalyse.js   — Claude AI prompt + response parsing
- hookit-backend/src/services/analyseEmail.js    — Orchestrator (shared with Person A)


## Dependencies
- Person A provides: working server with env vars, deployed Railway URL
- Person A provides: Mailgun setup to receive test emails
- You provide: calibrated scoring so Person C's dashboard shows meaningful data
