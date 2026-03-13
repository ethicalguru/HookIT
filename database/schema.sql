# ═══════════════════════════════════════════════════════════════
# HookIT — Supabase Database Schema
# ═══════════════════════════════════════════════════════════════
# Run this in: Supabase → SQL Editor → New Query → Run
# Person A should run this during initial setup
# ═══════════════════════════════════════════════════════════════

-- Users table (one row per Google-authenticated user)
create table users (
  id            uuid primary key,   -- matches Supabase Auth uid
  email         text not null unique,
  proxy_address text not null unique,
  created_at    timestamptz default now()
);

-- Emails table (all analysed emails, per user)
create table emails (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid not null references users(id) on delete cascade,
  received_at          timestamptz default now(),
  sender               text,
  recipient            text,
  subject              text,
  body_text            text,
  status               text default 'pending',
  -- 'safe' | 'suspicious' | 'phishing' | 'quarantined' | 'released' | 'deleted'
  verdict              text,
  final_score          int,
  url_score            int,
  header_score         int,
  ai_score             int,
  reasons              jsonb,
  urgency_flag         bool,
  impersonation_target text,
  spf_pass             bool,
  dkim_pass            bool,
  malicious_urls       jsonb,
  raw_headers          jsonb
);

-- ── Row Level Security ─────────────────────────────
alter table users  enable row level security;
alter table emails enable row level security;

-- Users can only see/edit their own user row
create policy "users: own row only"
  on users for all
  using (id = auth.uid());

-- Users can only see their own emails
create policy "emails: own emails only"
  on emails for all
  using (user_id = auth.uid());

-- Enable Realtime on emails table
alter publication supabase_realtime add table emails;

-- Useful indexes for dashboard queries
create index idx_emails_user_received on emails (user_id, received_at desc);
create index idx_emails_user_verdict  on emails (user_id, verdict);
