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
      try {
        console.log("Checking for active session...")

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log("Session found:", session.user.id)

          try {
            // Get user profile data
            const { data: userData, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (userData) {
              console.log("User profile found:", userData)

              setUser({
                id: session.user.id,
                email: session.user.email!,
                first_name: userData.first_name,
                last_name: userData.last_name,
              })
            } else {
              console.log("User profile not found, using basic auth info")

              // If we can't find the user profile, just use the basic auth user info
              setUser({
                id: session.user.id,
                email: session.user.email!,
              })
            }
          } catch (err) {
            console.error("Error fetching user profile:", err)

            // If there's an error, just use the basic auth user info
            setUser({
              id: session.user.id,
              email: session.user.email!,
            })
          }
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

        try {
          // Get user profile data
          const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (userData) {
            console.log("User profile found:", userData)

            setUser({
              id: session.user.id,
              email: session.user.email!,
              first_name: userData.first_name,
              last_name: userData.last_name,
            })
          } else {
            console.log("User profile not found, using basic auth info")

            // If we can't find the user profile, just use the basic auth user info
            setUser({
              id: session.user.id,
              email: session.user.email!,
            })
          }
        } catch (err) {
          console.error("Error in auth state change:", err)

          // If there's an error, just use the basic auth user info
          setUser({
            id: session.user.id,
            email: session.user.email!,
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
      console.log("Starting signup process for:", email)

      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
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

      // Try to create user profile, but don't fail if it doesn't work
      try {
        console.log("Attempting to create user profile...")

        // Check if users table exists
        const { error: checkError } = await supabase.from("users").select("count").limit(1)

        if (!checkError) {
          // Table exists, try to insert
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating user profile:", insertError)
          } else {
            console.log("User profile created successfully")
          }
        } else {
          console.log("Users table doesn't exist, skipping profile creation")
        }
      } catch (err) {
        console.error("Exception creating user profile:", err)
        // Continue anyway, as the auth user is created
      }

      // Sign in the user after successful signup
      console.log("Signing in after signup...")
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error("Error signing in after signup:", signInError)
        return { error: signInError }
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
    console.log("Signing out")
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
