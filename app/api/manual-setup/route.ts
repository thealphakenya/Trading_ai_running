import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Starting manual database setup check...")
    const tableResults = {}

    // Check if tables exist without trying to create them
    const tables = ["users", "api_credentials", "settings", "trades"]

    for (const table of tables) {
      try {
        // Try to query the table to see if it exists
        const { error } = await supabase.from(table).select("count").limit(1)

        if (error && error.code === "42P01") {
          console.log(`Table ${table} doesn't exist`)
          tableResults[table] = "Not found"
        } else if (error) {
          console.error(`Error checking table ${table}:`, error)
          tableResults[table] = `Error: ${error.message}`
        } else {
          console.log(`Table ${table} exists`)
          tableResults[table] = "Exists"
        }
      } catch (err) {
        console.error(`Error checking table ${table}:`, err)
        tableResults[table] = `Error: ${err.message}`
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database check complete",
      tables: tableResults,
      note: "Tables should be created via Supabase dashboard or migrations",
    })
  } catch (error) {
    console.error("Error checking database:", error)
    return NextResponse.json(
      {
        error: "Database check failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
