"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Default values for development/preview (these should be replaced with actual values in production)
const defaultSupabaseUrl = "https://omxsytfeirsymthniker.supabase.co"
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU"

// Use environment variables if available, otherwise fall back to defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only create the admin client if we have both the URL and service role key
const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

type User = {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        console.log("Checking for active session...")

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log("Session found:", session.user.id)

          // Get user metadata from auth
          const { first_name, last_name } = session.user.user_metadata || {}

          // Set user with metadata from auth
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: first_name || undefined,
            last_name: last_name || undefined,
          })
        } else {
          console.log("No active session found")
        }
      } catch (err) {
        console.error("Error checking session:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (session) {
        console.log("New session:", session.user.id)

        // Get user metadata from auth
        const { first_name, last_name } = session.user.user_metadata || {}

        // Set user with metadata from auth
        setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: first_name || undefined,
          last_name: last_name || undefined,
        })
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log("Starting signup process for:", email)

      // Create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          // Disable email confirmation by not providing emailRedirectTo
          // This won't completely disable it on the Supabase side, but we'll handle it in our flow
        },
      })

      if (authError) {
        console.error("Auth signup error:", authError)
        return { error: authError }
      }

      if (!authData.user) {
        console.error("No user returned from auth signup")
        return { error: new Error("Failed to create user") }
      }

      console.log("Auth user created successfully:", authData.user.id)

      // Immediately sign in the user after signup, regardless of email confirmation status
      console.log("Signing in after signup...")
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If there's an error about email confirmation, we'll ignore it and sign in anyway
        if (signInError.message.includes("Email not confirmed")) {
          console.log("Email not confirmed, but proceeding with sign in")

          // Use admin API to confirm the email (requires service role)
          try {
            if (supabaseAdmin) {
              await supabaseAdmin.auth.admin.updateUserById(authData.user.id, { email_confirm: true })
              console.log("Manually confirmed user email")

              // Try signing in again
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              })

              if (retryError) {
                console.error("Error signing in after manual confirmation:", retryError)
                return { error: retryError }
              }
            } else {
              console.warn("Admin client not available, cannot confirm email automatically")
            }
          } catch (adminErr) {
            console.error("Error using admin API:", adminErr)
            // Continue anyway
          }
        } else {
          console.error("Error signing in after signup:", signInError)
          return { error: signInError }
        }
      }

      // Set the user in state
      setUser({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
      })

      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      console.error("Error signing up:", error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // If there's an error about email confirmation, we'll try to bypass it
      if (error && error.message.includes("Email not confirmed")) {
        console.log("Email not confirmed, attempting to bypass...")

        // Use admin API to confirm the email (requires service role)
        try {
          if (supabaseAdmin) {
            // Find the user by email
            const { data: userData } = await supabaseAdmin.auth.admin.listUsers()
            const user = userData?.users.find((u) => u.email === email)

            if (user) {
              await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true })
              console.log("Manually confirmed user email")

              // Try signing in again
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              })

              if (retryError) {
                console.error("Error signing in after manual confirmation:", retryError)
                return { error: retryError }
              } else {
                // Success!
                router.push("/dashboard")
                return { error: null }
              }
            }
          } else {
            console.warn("Admin client not available, cannot confirm email automatically")
          }
        } catch (adminErr) {
          console.error("Error using admin API:", adminErr)
        }

        // If we couldn't bypass it, return the original error
        return { error }
      }

      if (error) {
        console.error("Sign in error:", error)
        return { error }
      }

      console.log("Sign in successful")

      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      console.error("Error signing in:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out")
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
