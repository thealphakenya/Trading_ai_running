-- This file contains SQL commands that can be run manually in the Supabase SQL Editor
-- if the automatic setup fails

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create api_credentials table
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  exchange TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  passphrase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on api_credentials table
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for api_credentials table
CREATE POLICY "Users can view their own credentials"
  ON public.api_credentials
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own credentials"
  ON public.api_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own credentials"
  ON public.api_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  auto_trading BOOLEAN DEFAULT false,
  confidence_threshold INTEGER DEFAULT 70,
  max_trade_size NUMERIC DEFAULT 5,
  stop_loss NUMERIC DEFAULT 2.5,
  take_profit NUMERIC DEFAULT 5,
  paper_trading BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for settings table
CREATE POLICY "Users can view their own settings"
  ON public.settings
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own settings"
  ON public.settings
  FOR UPDATE
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  confidence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on trades table
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trades table
CREATE POLICY "Users can view their own trades"
  ON public.trades
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own trades"
  ON public.trades
  FOR UPDATE
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
