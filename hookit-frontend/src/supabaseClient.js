// ═══════════════════════════════════════════════
// Supabase Client Singleton (frontend)
// Uses the anon/public key — RLS enforces per-user access
// ═══════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

// Environment variables (loaded by Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safety check so app doesn't silently fail
if (!supabaseUrl || !supabaseAnon) {
  console.error(
    '❌ Missing Supabase environment variables.\n' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  )
}

// Create Supabase client (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Backend API base URL (Express server)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'