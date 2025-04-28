"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ error: any; emailConfirmationRequired?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: any; emailNotConfirmed?: boolean }>
  signOut: () => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>
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

          setLoading(false)
        } else {
          console.log("No active session found")
          setLoading(false)
        }
      } catch (err) {
        console.error("Error checking session:", err)
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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

      // Check if email confirmation is required
      if (authData.session === null) {
        console.log("Email confirmation required")
        return {
          error: null,
          emailConfirmationRequired: true,
        }
      }

      // If we have a session, the user is already confirmed or confirmation is disabled
      console.log("User is already confirmed or confirmation is disabled")

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

      if (error) {
        console.error("Sign in error:", error)

        // Check if the error is about email confirmation
        if (error.message.includes("Email not confirmed")) {
          return { error, emailNotConfirmed: true }
        }

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

  const resendConfirmationEmail = async (email: string) => {
    try {
      console.log("Resending confirmation email to:", email)

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        console.error("Error resending confirmation email:", error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Error resending confirmation email:", error)
      return { error }
    }
  }

  const signOut = async () => {
    console.log("Signing out")
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resendConfirmationEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
