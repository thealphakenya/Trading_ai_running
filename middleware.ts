import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Default values for development/preview (replace in production)
const defaultSupabaseUrl = "https://omxsytfeirsymthniker.supabase.co";
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHN5dGZlaXJzeW10aG5pa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODc2NDgsImV4cCI6MjA2MTM2MzY0OH0.1q5IZW_zLfV8FPRTaODXe_wchPzUBwFxT1dRaKoINxU";

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();

    const hasEnvVars =
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string";

    if (!hasEnvVars && process.env.NODE_ENV === "production") {
      console.warn(
        "Warning: Missing Supabase environment variables in production. Authentication will not work properly."
      );
    }

    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey,
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/settings");

    const isAuthRoute =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/signup");

    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (session && isAuthRoute) {
      const redirectUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

// ✅ Correct matcher syntax
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
};
