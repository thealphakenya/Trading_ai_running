import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://omxsytfeirsymthniker.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that need the service role
export const supabaseAdmin = createClient(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTc4NzY0OCwiZXhwIjoyMDYxMzYzNjQ4fQ.8JDK6r4yj4Ub61Pmj5bG5FU1UzQfgn0cpC6Gn5DCve8",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
