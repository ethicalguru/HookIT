# ═══════════════════════════════════════════════════════════════════════
# TODO — Person D: Frontend — Email Table + Quarantine + Detail Modal
# ═══════════════════════════════════════════════════════════════════════
# Owner: Person D
# Focus: Email list table, quarantine inbox, detail modal, badges
# Files: hookit-frontend/src/components/EmailTable, QuarantineInbox,
#         EmailDetailModal, VerdictBadge, ScoreBar
# ═══════════════════════════════════════════════════════════════════════


## Context
You own the interactive data components — the email list table, the
quarantine inbox with release/delete actions, the detail modal that
shows full score breakdown + Claude AI reasoning, and the verdict badges.
The skeleton code is already written. Your job is to wire it up, test
the API integration, and make the UX polished and functional.


## Getting Started
1. cd hookit-frontend
2. cp .env.example .env          ← get values from Person A / Person C
3. npm install
4. npm run dev                    ← opens on http://localhost:5173
5. You'll need a Supabase account logged in to see data (coordinate with Person C)


## DAY 1 — Component Development  (Target: ~4 hours, start after Person A's API is up)

### Email List Table [0:00 – 1:30]
- [ ] Review src/components/EmailTable.jsx — sortable all-emails list
- [ ] Review src/components/VerdictBadge.jsx — coloured pill badge
- [ ] Test with data: ask Person B to seed some rows, or manually insert in Supabase
- [ ] Polish the table:
      - VerdictBadge shows correct color per verdict (safe=green, suspicious=yellow, phishing=red)
      - Score column has visual weight
      - Sender + Subject columns truncate nicely with ellipsis
      - Time column shows relative time (e.g., "2m ago") or formatted date
      - "View" button opens the detail modal
- [ ] Handle empty state: "No emails analysed yet" message
- [ ] Consider adding sorting: click column header to sort by score, time, verdict

### Quarantine Inbox [1:30 – 3:00]
- [ ] Review src/components/QuarantineInbox.jsx — list + action buttons
- [ ] API Integration — verify these work with Person A's backend:
      - GET /api/quarantine → loads quarantined emails
      - POST /api/quarantine/:id/release → forwards email + marks released
      - DELETE /api/quarantine/:id → marks deleted
- [ ] Test release flow:
      1. See quarantined email in list
      2. Click "Release" → email disappears from quarantine
      3. Email arrives in user's real inbox with [✓ Verified] prefix
- [ ] Test delete flow:
      1. Click "Delete" → email disappears from quarantine
- [ ] Add confirmation dialog before release/delete (optional but nice)
- [ ] Add loading state while API calls are in progress
- [ ] Handle errors: show toast/message if release fails

### Email Detail Modal [3:00 – 4:00]
- [ ] Review src/components/EmailDetailModal.jsx — full breakdown view
- [ ] Review src/components/ScoreBar.jsx — horizontal progress bars
- [ ] Test the modal opens when "View" is clicked in table or quarantine
- [ ] Verify all fields display correctly:
      - From, Subject, Received time
      - Score breakdown bars (URL, Header, AI, Final) with color coding
      - SPF/DKIM pass/fail indicators
      - Malicious URLs list (if any)
      - Claude AI reasons (bullet list)
      - Impersonation target badge
      - Urgency flag warning
- [ ] Polish the score bars:
      - Green (0-44), Yellow (45-70), Red (71-100)
      - Smooth width transition
      - Bold the "Final (weighted)" row
- [ ] Modal should close on overlay click and ✕ button
- [ ] Modal should scroll if content is long


## DAY 2 — Integration + Polish  (Target: ~8 hours)

### Full Integration Testing [0:00 – 2:00]
- [ ] Login → Dashboard → all emails appear in table
- [ ] Click email → modal opens with correct data
- [ ] Switch to Quarantine tab → only quarantined emails show
- [ ] Release an email → disappears from quarantine, status updates
- [ ] Delete an email → disappears from quarantine
- [ ] Send a new test email → appears in realtime in the table (no refresh)

### UX Polish [2:00 – 4:00]
- [ ] Add row hover effects on email table
- [ ] Add keyboard navigation: Esc closes modal
- [ ] Add transition/animation when modal opens
- [ ] Add button loading states (Release/Delete show spinner)
- [ ] Color-code the score number in the table:
      - Green for < 45, Yellow for 45-70, Red for > 70
- [ ] Ensure quarantine counter shows in tab label: "Quarantine (3)"
- [ ] Test with 0, 1, 10, 50 emails — does the layout hold up?

### Responsive & Accessibility [4:00 – 5:00]
- [ ] Table should scroll horizontally on small screens
- [ ] Modal should be usable on mobile
- [ ] Buttons should have hover/focus states
- [ ] Good contrast ratios on the dark theme

### Demo Prep [5:00 – 6:00]
- [ ] Walk through the 3-email demo flow:
      1. Clean email shows ✓ Safe badge, score ~5
      2. Phishing email shows ⛔ Phishing badge, score 80+, modal shows full breakdown
      3. Release from quarantine → status updates in real time
- [ ] Make sure the detail modal looks impressive for judges
- [ ] Coordinate final deploy with Person C


## Key Files You Own
- hookit-frontend/src/components/EmailTable.jsx       — All-emails table
- hookit-frontend/src/components/QuarantineInbox.jsx  — Quarantine list + actions
- hookit-frontend/src/components/EmailDetailModal.jsx — Score breakdown modal
- hookit-frontend/src/components/VerdictBadge.jsx     — Verdict pill badge
- hookit-frontend/src/components/ScoreBar.jsx         — Score progress bar


## Dependencies
- Person A provides: working backend API (quarantine endpoints)
- Person B provides: seed data in Supabase (realistic emails with scores)
- Person C provides: Dashboard.jsx passes emails + callbacks to your components
- Person C provides: global CSS variables + dashboard styles you can extend
