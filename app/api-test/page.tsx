"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function ApiTestPage() {
  const [vercelIp, setVercelIp] = useState(null)
  const [proxyIp, setProxyIp] = useState(null)
  const [bitgetResult, setBitgetResult] = useState(null)
  const [loading, setLoading] = useState({
    vercel: false,
    proxy: false,
    bitget: false,
  })
  const [error, setError] = useState({
    vercel: null,
    proxy: null,
    bitget: null,
  })

  const checkVercelIp = async () => {
    try {
      setLoading((prev) => ({ ...prev, vercel: true }))
      setError((prev) => ({ ...prev, vercel: null }))

      const response = await fetch("/api/check-ip")
      const data = await response.json()

      setVercelIp(data)
    } catch (err) {
      setError((prev) => ({ ...prev, vercel: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, vercel: false }))
    }
  }

  const checkProxyIp = async () => {
    try {
      setLoading((prev) => ({ ...prev, proxy: true }))
      setError((prev) => ({ ...prev, proxy: null }))

      const response = await fetch("/api/test-proxy")
      const data = await response.json()

      setProxyIp(data)
    } catch (err) {
      setError((prev) => ({ ...prev, proxy: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, proxy: false }))
    }
  }

  const testBitget = async () => {
    try {
      setLoading((prev) => ({ ...prev, bitget: true }))
      setError((prev) => ({ ...prev, bitget: null }))

      const response = await fetch("/api/bitget-test")
      const data = await response.json()

      setBitgetResult(data)
    } catch (err) {
      setError((prev) => ({ ...prev, bitget: err.message }))
    } finally {
      setLoading((prev) => ({ ...prev, bitget: false }))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">API Testing Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vercel IP Check</CardTitle>
            <CardDescription>Check what IP Vercel uses for outbound requests</CardDescription>
          </CardHeader>
          <CardContent>
            {error.vercel && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.vercel}</AlertDescription>
              </Alert>
            )}

            {vercelIp && (
              <div className="space-y-2">
                <div className="font-medium">Outbound IP: {vercelIp.vercelOutboundIp}</div>
                <div className="text-sm text-muted-foreground">{vercelIp.message}</div>
                <div className="text-xs text-muted-foreground">Checked at: {vercelIp.timestamp}</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkVercelIp} disabled={loading.vercel} className="w-full">
              {loading.vercel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
                </>
              ) : (
                "Check Vercel IP"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proxy IP Check</CardTitle>
            <CardDescription>Check what IP your proxy server uses</CardDescription>
          </CardHeader>
          <CardContent>
            {error.proxy && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.proxy}</AlertDescription>
              </Alert>
            )}

            {proxyIp && (
              <div className="space-y-2">
                <div className="font-medium">Proxy IP: {proxyIp.proxyIp}</div>
                <div className="text-sm text-muted-foreground">{proxyIp.message}</div>
                <div className="text-xs text-muted-foreground">Checked at: {proxyIp.timestamp}</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkProxyIp} disabled={loading.proxy} className="w-full">
              {loading.proxy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
                </>
              ) : (
                "Check Proxy IP"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bitget API Test</CardTitle>
            <CardDescription>Test connection to Bitget API via proxy</CardDescription>
          </CardHeader>
          <CardContent>
            {error.bitget && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.bitget}</AlertDescription>
              </Alert>
            )}

            {bitgetResult && (
              <div className="space-y-2">
                <Alert variant={bitgetResult.success ? "default" : "destructive"}>
                  {bitgetResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{bitgetResult.message}</AlertDescription>
                </Alert>

                {bitgetResult.data && (
                  <div className="mt-4 max-h-40 overflow-auto">
                    <pre className="text-xs p-2 bg-muted rounded-md">{JSON.stringify(bitgetResult.data, null, 2)}</pre>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">Tested at: {bitgetResult.timestamp}</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testBitget} disabled={loading.bitget} className="w-full">
              {loading.bitget ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                "Test Bitget API"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
