"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"  // Correct import

const defaultSupabaseUrl = "https://omxsytfeirsymthniker.supabase.co"
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ✅ Create client-side Supabase instance with session persistence
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ✅ Admin client for email confirmation
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
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { first_name, last_name } = session.user.user_metadata || {}
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: first_name || undefined,
            last_name: last_name || undefined,
          })
        }
      } catch (err) {
        console.error("Error checking session:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const { first_name, last_name } = session.user.user_metadata || {}
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      })

      if (authError || !authData.user) {
        return { error: authError || new Error("No user returned from signup") }
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError?.message.includes("Email not confirmed") && supabaseAdmin) {
        await supabaseAdmin.auth.admin.updateUserById(authData.user.id, { email_confirm: true })
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
        if (retryError) return { error: retryError }
      }

      setUser({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
      })

      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error?.message.includes("Email not confirmed") && supabaseAdmin) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const user = users?.users.find((u) => u.email === email)
        if (user) {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true })
          const { error: retryError } = await supabase.auth.signInWithPassword({ email, password })
          if (retryError) return { error: retryError }
        }
      }

      if (error) return { error }

      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    try {
      if (!supabaseAdmin) {
        throw new Error("Supabase admin client is not configured")
      }

      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) {
        throw listError
      }

      const user = users?.users.find((u) => u.email === email)
      if (!user) {
        throw new Error("User not found")
      }

      // Workaround to trigger confirmation email by updating the user's email
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email: user.email,
      })
      if (updateError) {
        throw updateError
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resendConfirmationEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
