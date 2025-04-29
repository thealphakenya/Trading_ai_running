import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Default values for development/preview (these should be replaced with actual values in production)
const defaultSupabaseUrl = "https://omxsytfeirsymthniker.supabase.co"
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU"

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()

    // Check if environment variables are available
    const hasEnvVars =
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string"

    // If environment variables are missing in production, log a warning
    if (!hasEnvVars && process.env.NODE_ENV === "production") {
      console.warn(
        "Warning: Missing Supabase environment variables in production. " + "Authentication will not work properly.",
      )
    }

    // Create middleware client with environment variables or fallbacks
    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey,
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there's no session and the user is trying to access a protected route
    if (!session && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/settings"))) {
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If there's a session and the user is trying to access auth routes
    if (session && (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup"))) {
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error, allow the request to continue
    // This prevents the middleware from blocking the entire application
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
}
