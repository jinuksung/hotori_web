import "server-only"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export function getSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error("Missing env: SUPABASE_URL")
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing env: SUPABASE_ANON_KEY")
  }

  // Read-only MVP: do not persist sessions/cookies.
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
