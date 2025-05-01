'use client'

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Loader2, AlertCircle, Info, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailResent, setEmailResent] = useState(false)

  const { signIn, resendConfirmationEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        if (signInError.message.includes("not confirmed")) {
          setError("Your email is not confirmed. Please check your inbox for a confirmation email.")
        } else {
          setError(signInError.message)
        }
      } else {
        router.push(redirectTo || "/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setError("Please enter your email address to resend the confirmation")
      return
    }

    setResendingEmail(true)
    setEmailResent(false)

    try {
      const { error } = await resendConfirmationEmail(email)

      if (error) {
        setError(error.message)
      } else {
        setEmailResent(true)
        setError(null)
      }
    } catch (err) {
      setError("Failed to resend confirmation email. Please try again.")
      console.error(err)
    } finally {
      setResendingEmail(false)
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
          <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && error.includes("not confirmed") && (
              <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {error}{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-amber-800 underline ml-1"
                    onClick={handleResendEmail}
                    disabled={resendingEmail || emailResent}
                  >
                    {resendingEmail ? "Sending..." : emailResent ? "Email sent!" : "Resend confirmation email"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {error && !error.includes("not confirmed") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {emailResent && (
              <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Confirmation email has been resent. Please check your inbox and spam folder.
                </AlertDescription>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-emerald-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
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
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-emerald-500 hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <Link href="/dev-login" className="hover:underline">
                Development Login (Bypass Email Confirmation)
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
