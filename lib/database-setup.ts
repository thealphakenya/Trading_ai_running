import { supabaseAdmin } from "./supabase"

export async function setupDatabase() {
  // Create users table if it doesn't exist
  const { error: usersError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
    table_name: "users",
    table_definition: `
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `,
  })

  if (usersError) {
    console.error("Error creating users table:", usersError)
  }

  // Create api_credentials table if it doesn't exist
  const { error: credentialsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
    table_name: "api_credentials",
    table_definition: `
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id),
      exchange TEXT NOT NULL,
      api_key TEXT NOT NULL,
      api_secret TEXT NOT NULL,
      passphrase TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `,
  })

  if (credentialsError) {
    console.error("Error creating api_credentials table:", credentialsError)
  }

  // Create settings table if it doesn't exist
  const { error: settingsError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
    table_name: "settings",
    table_definition: `
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id),
      auto_trading BOOLEAN DEFAULT false,
      confidence_threshold INTEGER DEFAULT 70,
      max_trade_size NUMERIC DEFAULT 5,
      stop_loss NUMERIC DEFAULT 2.5,
      take_profit NUMERIC DEFAULT 5,
      paper_trading BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `,
  })

  if (settingsError) {
    console.error("Error creating settings table:", settingsError)
  }

  // Create trades table if it doesn't exist
  const { error: tradesError } = await supabaseAdmin.rpc("create_table_if_not_exists", {
    table_name: "trades",
    table_definition: `
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id),
      symbol TEXT NOT NULL,
      side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
      amount NUMERIC NOT NULL,
      price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
      confidence INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `,
  })

  if (tradesError) {
    console.error("Error creating trades table:", tradesError)
  }
}
