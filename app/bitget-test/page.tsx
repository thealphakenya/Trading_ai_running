"use client"

import { useState, useEffect } from "react"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function BitgetTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/bitget/test-connection")
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to test Bitget connection")
      } else {
        setResult(data)
      }
    } catch (err) {
      setError("An unexpected error occurred while testing the connection")
      console.error("Error testing Bitget connection:", err)
    } finally {
      setLoading(false)
    }
  }

  // Test connection on page load
  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Bitget API Connection Test</CardTitle>
          <CardDescription>Test the connection to your Bitget account using your API credentials</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
              <p className="text-lg font-medium">Testing connection to Bitget API...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : result ? (
            <div className="space-y-6">
              <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {result.success && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Balance</h3>
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-sm">{JSON.stringify(result.balance, null, 2)}</pre>
                    </div>
                  </div>

                  {result.tradingPairs && !result.tradingPairs.error && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Trading Pairs</h3>
                      <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                        <pre className="text-sm">{JSON.stringify(result.tradingPairs, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {result.ticker && !result.ticker.error && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">BTC/USDT Ticker</h3>
                      <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                        <pre className="text-sm">{JSON.stringify(result.ticker, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!result.success && result.details && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Error Details</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                    <pre className="text-sm">{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button onClick={testConnection} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
              </>
            ) : (
              "Test Connection Again"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
