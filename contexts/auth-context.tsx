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
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Get user profile data
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (userData) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: userData.first_name,
            last_name: userData.last_name,
          })
        }
      }

      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Get user profile data
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (userData) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: userData.first_name,
            last_name: userData.last_name,
          })
        }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
        })

        // Store Victor's Bitget credentials
        const { error: credentialsError } = await supabase.from("api_credentials").insert({
          user_id: data.user.id,
          exchange: "bitget",
          api_key: "bg_1d7ea7c56644fb5da18a400c92a425d7",
          api_secret: "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13",
          passphrase: "Victor9798",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Create default settings
        const { error: settingsError } = await supabase.from("settings").insert({
          user_id: data.user.id,
          auto_trading: false,
          confidence_threshold: 70,
          max_trade_size: 5,
          stop_loss: 2.5,
          take_profit: 5,
          paper_trading: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError || credentialsError || settingsError) {
          console.error("Error creating user profile:", profileError || credentialsError || settingsError)
        }

        router.push("/dashboard")
      }

      return { error: null }
    } catch (error) {
      console.error("Error signing up:", error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      router.push("/dashboard")
      return { error: null }
    } catch (error) {
      console.error("Error signing in:", error)
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
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
