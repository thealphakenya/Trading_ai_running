"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Loader2, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DevLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      // First, try to sign up the user (this will either create a new user or return an error if the user exists)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // This is a development bypass - in production, you'd want email confirmation
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      // If the user already exists, try to sign in
      if (signUpError || !signUpData.user) {
        console.log("User might already exist, trying to sign in...")

        // Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          // If we get an "Email not confirmed" error, we'll try to bypass it
          if (signInError.message.includes("Email not confirmed")) {
            console.log("Email not confirmed, attempting to bypass for development...")

            // For development purposes only - this creates a custom token
            // In production, you should never do this
            try {
              // Try to get a session using the email/password directly
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

              if (!sessionError && sessionData.session) {
                console.log("Successfully created session")
                router.push("/dashboard")
                return
              }
            } catch (sessionErr) {
              console.error("Session creation error:", sessionErr)
              setError("Failed to create session. This is a development-only page.")
            }
          } else {
            setError(signInError.message)
          }
        } else {
          // Sign in successful
          router.push("/dashboard")
        }
      } else {
        // New user created successfully
        console.log("New user created successfully")
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              <span className="text-xl font-bold">TradingAI</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Development Login</CardTitle>
          <CardDescription>This page bypasses email confirmation for development purposes</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a development-only page that attempts to bypass email confirmation. Do not use in production.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                "Dev Sign In"
              )}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-emerald-500 hover:underline">
                Back to regular login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
