import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Database, FileCode } from "lucide-react"

export default function SetupInstructionsPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Database Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up the required database tables for the TradingAI application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              These instructions are for administrators who need to set up the database tables manually. Regular users
              don't need to perform these steps.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Access the Supabase Dashboard</h2>
            <p>
              Log in to your Supabase account and navigate to the project dashboard. You can access it at{" "}
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:underline"
              >
                https://app.supabase.com
              </a>
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Open the SQL Editor</h2>
            <p>
              In the left sidebar, click on "SQL Editor" to open the SQL editor. This is where you'll run the SQL
              commands to create the necessary tables.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 3: Run the SQL Commands</h2>
            <p>Copy and paste the following SQL commands into the SQL editor and run them:</p>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">
                {`-- Create users table
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
  WITH CHECK (auth.uid() = user_id);`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 4: Verify the Tables</h2>
            <p>
              After running the SQL commands, navigate to the "Table Editor" in the left sidebar to verify that all the
              tables have been created successfully. You should see the following tables:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>users</li>
              <li>api_credentials</li>
              <li>settings</li>
              <li>trades</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex gap-4">
            <Link href="/signup">
              <Button variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Check Database
              </Button>
            </Link>
            <Link href="/lib/create-tables.sql" download>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <FileCode className="mr-2 h-4 w-4" />
                Download SQL File
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
