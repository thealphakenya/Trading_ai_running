import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Create users table if it doesn't exist
    const { error: usersError } = await supabaseAdmin.from("users").select("count").limit(1).maybeSingle()

    if (usersError && usersError.code === "42P01") {
      // Table doesn't exist, create it using RLS policies
      await supabaseAdmin.rpc("create_users_table")
    }

    // Create api_credentials table if it doesn't exist
    const { error: credentialsError } = await supabaseAdmin
      .from("api_credentials")
      .select("count")
      .limit(1)
      .maybeSingle()

    if (credentialsError && credentialsError.code === "42P01") {
      // Table doesn't exist, create it using RLS policies
      await supabaseAdmin.rpc("create_api_credentials_table")
    }

    // Create settings table if it doesn't exist
    const { error: settingsError } = await supabaseAdmin.from("settings").select("count").limit(1).maybeSingle()

    if (settingsError && settingsError.code === "42P01") {
      // Table doesn't exist, create it using RLS policies
      await supabaseAdmin.rpc("create_settings_table")
    }

    // Create trades table if it doesn't exist
    const { error: tradesError } = await supabaseAdmin.from("trades").select("count").limit(1).maybeSingle()

    if (tradesError && tradesError.code === "42P01") {
      // Table doesn't exist, create it using RLS policies
      await supabaseAdmin.rpc("create_trades_table")
    }

    return NextResponse.json({ success: true, message: "Database setup complete" })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ error: "Failed to set up database" }, { status: 500 })
  }
}
