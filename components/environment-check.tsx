"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function EnvironmentCheck() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // Check if Supabase environment variables are available
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          setStatus("error")
          setMessage("Missing Supabase environment variables. Please check your environment configuration.")
          return
        }

        // Try to fetch from the health endpoint
        const response = await fetch("/api/health")
        const data = await response.json()

        if (data.status === "ok") {
          setStatus("success")
          setMessage("Environment is properly configured.")
        } else {
          setStatus("error")
          setMessage("Environment check failed. Please check the server logs.")
        }
      } catch (error) {
        setStatus("error")
        setMessage(
          error instanceof Error ? `Environment check error: ${error.message}` : "Unknown environment check error",
        )
      }
    }

    checkEnvironment()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="mb-4 border-gray-700 bg-gray-800">
        <AlertCircle className="h-4 w-4 animate-pulse text-gray-400" />
        <AlertTitle>Checking environment...</AlertTitle>
        <AlertDescription>Verifying application configuration.</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Environment Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-green-800 bg-green-900/20">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>Environment Ready</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
