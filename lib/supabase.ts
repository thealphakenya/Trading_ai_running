import { createClient } from "@supabase/supabase-js"

// Default values for development/preview (these should be replaced with actual values in production)
const defaultSupabaseUrl = "https://omxsytfeirsymthniker.supabase.co"
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU"

// Use environment variables if available, otherwise fall back to defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey

// Log which values we're using (helpful for debugging)
if (typeof window !== "undefined") {
  console.log(`Using Supabase URL: ${supabaseUrl.substring(0, 20)}...`)
  console.log(`Using environment variables: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Create a new Supabase client with elevated privileges if service role key is available
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null // If no service role key, return null

// Helper function to check if admin client is available
export const isAdminClientAvailable = () => !!supabaseAdmin
