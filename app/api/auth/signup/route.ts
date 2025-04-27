import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    console.log("Starting signup process for:", email)

    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error("Auth signup error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      console.error("No user returned from auth signup")
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    console.log("Auth user created successfully:", authData.user.id)

    // Step 2: Create user profile
    try {
      console.log("Creating user profile...")

      // Direct insert to users table
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating user profile:", insertError)
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }

      console.log("User profile created successfully")
    } catch (err) {
      console.error("Exception creating user profile:", err)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    // Step 3: Store Bitget credentials
    try {
      const { error: credentialsError } = await supabase.from("api_credentials").insert({
        user_id: authData.user.id,
        exchange: "bitget",
        api_key: "bg_1d7ea7c56644fb5da18a400c92a425d7",
        api_secret: "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13",
        passphrase: "Victor9798",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (credentialsError) {
        console.error("Error storing API credentials:", credentialsError)
        // Continue anyway, as this is not critical for signup
      } else {
        console.log("API credentials stored successfully")
      }
    } catch (err) {
      console.error("Exception storing API credentials:", err)
      // Continue anyway
    }

    // Step 4: Create default settings
    try {
      const { error: settingsError } = await supabase.from("settings").insert({
        user_id: authData.user.id,
        auto_trading: false,
        confidence_threshold: 70,
        max_trade_size: 5,
        stop_loss: 2.5,
        take_profit: 5,
        paper_trading: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (settingsError) {
        console.error("Error creating settings:", settingsError)
        // Continue anyway, as this is not critical for signup
      } else {
        console.log("Settings created successfully")
      }
    } catch (err) {
      console.error("Exception creating settings:", err)
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
      },
    })
  } catch (error) {
    console.error("Error in signup API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
