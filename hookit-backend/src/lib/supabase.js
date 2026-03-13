// ═══════════════════════════════════════════════
// Supabase Service Client (bypasses RLS)
// Uses the service_role key for backend operations
// ═══════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment')
  process.exit(1)
}

export const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY    // service_role key — bypasses RLS
)
