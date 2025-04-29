"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ErrorBoundary fallback={<EnvironmentErrorPage />}>
        <AuthProvider>{children}</AuthProvider>
      </ErrorBoundary>
      <Toaster />
    </ThemeProvider>
  )
}

// Simple error boundary component
function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Error page for environment variable issues
function EnvironmentErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Environment Configuration Error</h1>
      <p className="mb-6 max-w-md text-gray-400">
        The application is missing required environment variables. Please check your environment configuration.
      </p>
      <div className="rounded-md bg-amber-900/30 p-4 text-left">
        <h2 className="mb-2 font-semibold">Required Environment Variables:</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-amber-200">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
      </div>
    </div>
  )
}
