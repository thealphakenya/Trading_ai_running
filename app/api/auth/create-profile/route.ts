import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { userId, email, firstName, lastName } = await request.json()

    console.log("Creating user profile for:", userId)

    // First, check if the users table exists
    const { error: checkError } = await supabaseAdmin.from("users").select("count").limit(1)

    if (checkError && checkError.code === "42P01") {
      console.log("Users table doesn't exist, creating it...")

      // Create the users table
      const { error: createError } = await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL UNIQUE,
            first_name TEXT,
            last_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createError) {
        console.error("Error creating users table:", createError)

        // Try direct SQL
        try {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: "temporary-password",
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
            },
          })

          if (error) {
            console.error("Error creating user with admin API:", error)
            return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
          }

          return NextResponse.json({ success: true, message: "User created with admin API" })
        } catch (sqlErr) {
          console.error("Error with direct SQL:", sqlErr)
          return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
        }
      }
    }

    // Try to insert the user profile
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error creating user profile with admin client:", insertError)

      // Try direct SQL as a last resort
      const { error: sqlError } = await supabaseAdmin.rpc("execute_sql", {
        sql_query: `
          INSERT INTO public.users (id, email, first_name, last_name, created_at)
          VALUES ('${userId}', '${email}', '${firstName}', '${lastName}', NOW())
          ON CONFLICT (id) DO UPDATE
          SET first_name = '${firstName}', last_name = '${lastName}';
        `,
      })

      if (sqlError) {
        console.error("Error with direct SQL insert:", sqlError)
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "User profile created successfully" })
  } catch (error) {
    console.error("Error in create profile API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
