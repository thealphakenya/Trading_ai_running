import { createBrowserClient } from "@supabase/ssr" // Import from @supabase/ssr

// Default values (used only if env variables are missing — not recommended in production)
const defaultSupabaseUrl = "https://omxsytfeirsymthniker.supabase.co"
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU"

// Read from environment variables (fallback to default values if not provided)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey

// Create the client-side Supabase instance using `createBrowserClient` from @supabase/ssr
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,     // Enables session persistence in local storage
    autoRefreshToken: true,   // Automatically refreshes the token when it expires
    detectSessionInUrl: true, // Automatically detects session from the URL (useful for OAuth flows)
  },
})

// Optional: create an admin client (only used server-side, for example, for email confirmation)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// The admin client should only be created server-side, so ensure it's not created client-side
export const supabaseAdmin = typeof window === "undefined" && supabaseServiceRoleKey
  ? createBrowserClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false, // Do not auto-refresh tokens for the admin client
        persistSession: false,    // Do not persist sessions on the admin client
      },
    })
  : null

// Utility function to check if the admin client is available
export const isAdminClientAvailable = () => !!supabaseAdmin
