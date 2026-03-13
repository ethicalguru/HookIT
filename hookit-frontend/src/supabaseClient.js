// ═══════════════════════════════════════════════
// Supabase Client Singleton (frontend)
// Uses the anon/public key — RLS enforces per-user access
// ═══════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnon)
export const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:3000'
