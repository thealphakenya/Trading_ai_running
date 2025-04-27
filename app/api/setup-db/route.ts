import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Starting database setup...")
    const tables = ["users", "api_credentials", "settings", "trades"]
    const tableResults = {}

    // Check if tables exist and create them if they don't
    for (const table of tables) {
      try {
        // Try to query the table to see if it exists
        const { error: queryError } = await supabaseAdmin.from(table).select("count").limit(1)

        if (queryError && queryError.code === "42P01") {
          // Table doesn't exist, create it
          console.log(`Table ${table} doesn't exist, creating it...`)

          let createError = null

          if (table === "users") {
            const { error } = await supabaseAdmin.from(table).insert({
              id: "00000000-0000-0000-0000-000000000000",
              email: "setup@example.com",
              first_name: "Setup",
              last_name: "User",
              created_at: new Date().toISOString(),
            })
            createError = error
          } else if (table === "api_credentials") {
            const { error } = await supabaseAdmin.from(table).insert({
              user_id: "00000000-0000-0000-0000-000000000000",
              exchange: "setup",
              api_key: "setup",
              api_secret: "setup",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            createError = error
          } else if (table === "settings") {
            const { error } = await supabaseAdmin.from(table).insert({
              user_id: "00000000-0000-0000-0000-000000000000",
              auto_trading: false,
              confidence_threshold: 70,
              max_trade_size: 5,
              stop_loss: 2.5,
              take_profit: 5,
              paper_trading: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            createError = error
          } else if (table === "trades") {
            const { error } = await supabaseAdmin.from(table).insert({
              user_id: "00000000-0000-0000-0000-000000000000",
              symbol: "SETUP/USDT",
              side: "buy",
              amount: 1,
              price: 1,
              confidence: 70,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            createError = error
          }

          if (createError) {
            console.error(`Error creating table ${table}:`, createError)
            tableResults[table] = "Error: " + createError.message
          } else {
            console.log(`Table ${table} created successfully`)
            tableResults[table] = "Created"

            // Delete the setup record
            await supabaseAdmin.from(table).delete().eq("id", "00000000-0000-0000-0000-000000000000")
          }
        } else if (queryError) {
          console.error(`Error checking table ${table}:`, queryError)
          tableResults[table] = "Error: " + queryError.message
        } else {
          console.log(`Table ${table} already exists`)
          tableResults[table] = "Exists"
        }
      } catch (error) {
        console.error(`Error processing table ${table}:`, error)
        tableResults[table] = "Error: " + error.message
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup complete",
      details: tableResults,
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        error: "Failed to set up database",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
