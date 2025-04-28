import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Database } from "lucide-react"

export default function SetupDbPage() {
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
              The application encountered an error with the database schema. Follow these instructions to fix it.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Option 1: Create the Users Table</h2>
            <p>
              Run the following SQL in the Supabase SQL Editor to create the users table with the correct structure:
            </p>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">
                {`-- Create users table if it doesn't exist
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

-- Create policy to allow inserting own data
CREATE POLICY "Users can insert their own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Option 2: Continue Without the Users Table</h2>
            <p>
              The application has been updated to work without the users table by storing user information in the auth
              metadata. You can continue using the application without creating the users table.
            </p>
            <p>
              User first name and last name will be stored in the auth.users metadata instead of a separate users table.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Database className="mr-2 h-4 w-4" />
              Try Signup Again
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
