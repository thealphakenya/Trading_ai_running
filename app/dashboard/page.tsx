"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bell,
  Brain,
  Clock,
  CreditCard,
  History,
  Home,
  LineChartIcon,
  Loader2,
  Power,
  Settings,
  Shield,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getKlineData, initWebSocket } from "@/lib/bitget"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const { user } = useAuth()
  const [autoTrading, setAutoTrading] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [currentConfidence, setCurrentConfidence] = useState(78)
  const [systemStatus, setSystemStatus] = useState("online") // online, offline, warning
  const [selectedAsset, setSelectedAsset] = useState("BTC/USDT")
  const [timeframe, setTimeframe] = useState("1h")
  const [accountBalance, setAccountBalance] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [priceData, setPriceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  // Test Bitget connection
  const testBitgetConnection = async () => {
    try {
      setTestingConnection(true)
      setError(null)

      console.log("Testing Bitget connection...")
      const response = await fetch("/api/bitget/test-connection")
      const data = await response.json()

      if (!data.success) {
        console.error("Bitget connection test failed:", data)
        setError(`Failed to connect to Bitget: ${data.message || "Unknown error"}`)
        setConnectionStatus("error")
        return false
      }

      console.log("Bitget connection successful:", data)
      setConnectionStatus("connected")

      // If we have balance data, set it
      if (data.balance && data.balance.data) {
        setAccountBalance(data.balance.data)
      }

      return true
    } catch (err) {
      console.error("Error testing Bitget connection:", err)
      setError("Failed to connect to Bitget API. Please check your credentials.")
      setConnectionStatus("error")
      return false
    } finally {
      setTestingConnection(false)
      setLoading(false)
    }
  }

  // Test connection on component mount
  useEffect(() => {
    if (user) {
      testBitgetConnection()
    }
  }, [user])

  // Fetch user settings from Supabase
  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).single()

        if (data) {
          setAutoTrading(data.auto_trading)
          setConfidenceThreshold(data.confidence_threshold)
        }
      }

      fetchSettings()
    }
  }, [user])

  // Fetch historical price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const symbol = selectedAsset.replace("/", "")
        const period = timeframe
        const response = await getKlineData(symbol, period, 100)

        if (response.code === "00000") {
          // Transform the data for the chart
          const formattedData = response.data.map((candle: any) => ({
            time: new Date(candle[0]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            price: Number.parseFloat(candle[4]), // Close price
            volume: Number.parseFloat(candle[5]),
          }))

          setPriceData(formattedData)
        }
      } catch (err) {
        console.error("Error fetching price data:", err)
      }
    }

    if (connectionStatus === "connected") {
      fetchPriceData()

      // Set up WebSocket for real-time updates
      const ws = initWebSocket((data) => {
        if (data.arg?.channel === "ticker" && data.data) {
          // Update latest price
          setPriceData((prevData) => {
            if (prevData.length === 0) return prevData

            const newData = [...prevData]
            const lastIndex = newData.length - 1
            newData[lastIndex] = {
              ...newData[lastIndex],
              price: Number.parseFloat(data.data[0].last),
            }

            return newData
          })
        }
      })

      return () => {
        ws.close()
      }
    }
  }, [selectedAsset, timeframe, connectionStatus])

  // Simulate changing confidence score
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConfidence((prev) => {
        const change = Math.random() * 6 - 3
        const newValue = Math.round(prev + change)
        return Math.min(Math.max(newValue, 30), 95) // Keep between 30-95
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Calculate total balance
  const calculateTotalBalance = () => {
    if (!accountBalance || !accountBalance.length) return 0

    return accountBalance
      .reduce((total: number, asset: any) => {
        return total + Number.parseFloat(asset.usdBalance || 0)
      }, 0)
      .toFixed(2)
  }

  // Mock data for recent trades
  const recentTrades = [
    {
      id: 1,
      asset: "BTC/USDT",
      type: "buy",
      amount: 0.05,
      price: 66500,
      time: "16:32:45",
      confidence: 82,
      status: "completed",
      profit: 2.3,
    },
    {
      id: 2,
      asset: "ETH/USDT",
      type: "sell",
      amount: 0.8,
      price: 3450,
      time: "15:47:12",
      confidence: 79,
      status: "completed",
      profit: 1.5,
    },
    {
      id: 3,
      asset: "SOL/USDT",
      type: "buy",
      amount: 5,
      price: 138,
      time: "14:22:30",
      confidence: 75,
      status: "active",
      profit: null,
    },
    {
      id: 4,
      asset: "BTC/USDT",
      type: "sell",
      amount: 0.03,
      price: 65200,
      time: "12:15:22",
      confidence: 81,
      status: "completed",
      profit: -0.8,
    },
    {
      id: 5,
      asset: "ETH/USDT",
      type: "buy",
      amount: 0.5,
      price: 3380,
      time: "10:05:17",
      confidence: 77,
      status: "completed",
      profit: 1.2,
    },
  ]

  const systemLogs = [
    { time: "17:02:12", level: "info", message: "Confidence score updated: 78%" },
    { time: "16:32:45", level: "success", message: "Trade executed: BUY 0.05 BTC at $66,500" },
    { time: "16:30:22", level: "info", message: "High confidence signal detected (82%) for BTC/USDT" },
    { time: "15:47:12", level: "success", message: "Trade executed: SELL 0.8 ETH at $3,450" },
    { time: "15:45:33", level: "info", message: "High confidence signal detected (79%) for ETH/USDT" },
    { time: "15:00:00", level: "info", message: "System health check: All systems operational" },
    { time: "14:22:30", level: "success", message: "Trade executed: BUY 5 SOL at $138" },
    { time: "14:20:15", level: "info", message: "High confidence signal detected (75%) for SOL/USDT" },
    { time: "13:15:00", level: "warning", message: "Market volatility increased: Adjusting risk parameters" },
    { time: "12:15:22", level: "success", message: "Trade executed: SELL 0.03 BTC at $65,200" },
  ]

  // Save settings to Supabase
  const saveSettings = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("settings")
        .update({
          auto_trading: autoTrading,
          confidence_threshold: confidenceThreshold,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) {
        console.error("Error saving settings:", error)
      }
    } catch (err) {
      console.error("Error saving settings:", err)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r">
        <div className="flex items-center gap-2 p-6 border-b">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold">TradingAI</span>
        </div>
        <div className="flex flex-col p-4 gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/trades"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4" />
            <span>Trade History</span>
          </Link>
          <Link
            href="/dashboard/market"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <LineChartIcon className="h-4 w-4" />
            <span>Market View</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link
            href="/dashboard/security"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </Link>
          <Link href="/bitget-test" className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Test Bitget Connection</span>
          </Link>
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-emerald-500"
                    : connectionStatus === "connecting"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm">Bitget Connection</span>
            </div>
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
          <Button
            variant="outline"
            className="w-full mb-2"
            size="sm"
            onClick={testBitgetConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>Test Connection</>
            )}
          </Button>
          <Button variant="destructive" className="w-full" size="sm">
            <Power className="h-4 w-4 mr-2" />
            Emergency Stop
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {user?.first_name?.charAt(0) || ""}
                  {user?.last_name?.charAt(0) || ""}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="link"
                  className="p-0 h-auto ml-2 text-white underline"
                  onClick={testBitgetConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? "Testing..." : "Test connection again"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === "connected" && (
            <Alert variant="default" className="mb-6 bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully connected to Bitget API. Your account is ready for trading.
              </AlertDescription>
            </Alert>
          )}

          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Balance</CardDescription>
                <CardTitle className="text-2xl">{loading ? "Loading..." : `$${calculateTotalBalance()}`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-emerald-500">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span>+3.2%</span>
                  <span className="text-muted-foreground ml-1">from yesterday</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Today's P/L</CardDescription>
                <CardTitle className="text-2xl">+$487.25</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-emerald-500">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span>+1.8%</span>
                  <span className="text-muted-foreground ml-1">today</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Trades</CardDescription>
                <CardTitle className="text-2xl">3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <span className="text-emerald-500 mr-1">2 Buy</span>
                  <span className="text-red-500">1 Sell</span>
                </div>
              </CardContent>
            </Card>
            <Card
              className={`border-l-4 ${currentConfidence >= confidenceThreshold ? "border-l-emerald-500" : "border-l-amber-500"}`}
            >
              <CardHeader className="pb-2">
                <CardDescription>Current Confidence</CardDescription>
                <CardTitle className="text-2xl">{currentConfidence}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <span className={currentConfidence >= confidenceThreshold ? "text-emerald-500" : "text-amber-500"}>
                    {currentConfidence >= confidenceThreshold ? "Above threshold" : "Below threshold"}
                  </span>
                  <span className="text-muted-foreground ml-1">({confidenceThreshold}%)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto Trading Control */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Auto Trading</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoTrading}
                    onCheckedChange={(checked) => {
                      setAutoTrading(checked)
                      saveSettings()
                    }}
                    id="auto-trading"
                    disabled={connectionStatus !== "connected"}
                  />
                  <Label htmlFor="auto-trading" className="font-medium">
                    {autoTrading ? "Enabled" : "Disabled"}
                  </Label>
                </div>
              </div>
              <CardDescription>
                When enabled, the system will automatically execute trades when confidence exceeds threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                    <span className="text-sm font-medium">{confidenceThreshold}%</span>
                  </div>
                  <Slider
                    id="confidence-threshold"
                    min={50}
                    max={90}
                    step={1}
                    value={[confidenceThreshold]}
                    onValueChange={(value) => {
                      setConfidenceThreshold(value[0])
                      saveSettings()
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Trades will only execute when AI confidence is above this threshold
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-trade-size">Max Trade Size</Label>
                    <div className="flex items-center">
                      <Input id="max-trade-size" type="number" defaultValue={5} className="rounded-r-none" />
                      <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">%</div>
                    </div>
                    <p className="text-xs text-muted-foreground">Maximum percentage of portfolio per trade</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stop-loss">Stop Loss</Label>
                    <div className="flex items-center">
                      <Input id="stop-loss" type="number" defaultValue={2.5} className="rounded-r-none" />
                      <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">%</div>
                    </div>
                    <p className="text-xs text-muted-foreground">Automatic stop loss percentage</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="take-profit">Take Profit</Label>
                    <div className="flex items-center">
                      <Input id="take-profit" type="number" defaultValue={5} className="rounded-r-none" />
                      <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">%</div>
                    </div>
                    <p className="text-xs text-muted-foreground">Automatic take profit percentage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Data and Confidence */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Market Data</CardTitle>
                    <CardDescription>Current price and volume</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                        <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                        <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5m">5m</SelectItem>
                        <SelectItem value="15m">15m</SelectItem>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="4h">4h</SelectItem>
                        <SelectItem value="1d">1d</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {connectionStatus !== "connected" ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Connect to Bitget to view price data</p>
                    </div>
                  ) : priceData.length > 0 ? (
                    <ChartContainer
                      config={{
                        price: {
                          label: "Price",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <LineChart data={priceData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <XAxis dataKey="time" tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                          domain={["auto", "auto"]}
                          width={60}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="var(--color-price)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Loading price data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Confidence Score</CardTitle>
                <CardDescription>AI prediction confidence over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      confidence: {
                        label: "Confidence",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <LineChart
                      data={[
                        { time: "09:00", confidence: 65 },
                        { time: "10:00", confidence: 68 },
                        { time: "11:00", confidence: 72 },
                        { time: "12:00", confidence: 75 },
                        { time: "13:00", confidence: 73 },
                        { time: "14:00", confidence: 69 },
                        { time: "15:00", confidence: 74 },
                        { time: "16:00", confidence: 78 },
                        { time: "17:00", confidence: currentConfidence },
                      ]}
                      margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                    >
                      <XAxis dataKey="time" tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                        domain={[50, 100]}
                        width={60}
                      />
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="var(--color-confidence)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      {/* Threshold line */}
                      <Line
                        type="monotone"
                        dataKey={() => confidenceThreshold}
                        stroke="#888"
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Confidence</span>
                    <span
                      className={`text-sm font-bold ${
                        currentConfidence >= confidenceThreshold ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {currentConfidence}%
                    </span>
                  </div>
                  <Progress
                    value={currentConfidence}
                    max={100}
                    className={`h-2 ${currentConfidence >= confidenceThreshold ? "bg-emerald-100" : "bg-amber-100"}`}
                    indicatorClassName={currentConfidence >= confidenceThreshold ? "bg-emerald-500" : "bg-amber-500"}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Threshold: {confidenceThreshold}%</span>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span className="text-xs">
                        {currentConfidence >= confidenceThreshold ? "Ready to trade" : "Monitoring market"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades and System Logs */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Latest automated trading activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={trade.type === "buy" ? "default" : "destructive"} className="uppercase">
                            {trade.type}
                          </Badge>
                          <span className="font-medium">{trade.asset}</span>
                          <Badge variant="outline" className="ml-1">
                            {trade.confidence}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{trade.time}</span>
                          <CreditCard className="h-3 w-3 ml-2" />
                          <span>${(trade.amount * trade.price).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${trade.price.toLocaleString()}</div>
                        {trade.profit !== null && (
                          <div className={`text-sm ${trade.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {trade.profit >= 0 ? (
                              <span className="flex items-center justify-end">
                                <ArrowUp className="h-3 w-3 mr-1" />+{trade.profit}%
                              </span>
                            ) : (
                              <span className="flex items-center justify-end">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                {trade.profit}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" size="sm">
                    View All Trades
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system activity and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-auto">
                  {systemLogs.map((log, index) => (
                    <div key={index} className="text-sm border-l-2 pl-3 py-1 mb-2 last:mb-0 border-l-muted-foreground">
                      <div className="flex items-center gap-2">
                        {log.level === "success" && (
                          <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />
                        )}
                        {log.level === "info" && <Badge variant="secondary" className="h-1.5 w-1.5 rounded-full p-0" />}
                        {log.level === "warning" && (
                          <Badge variant="warning" className="h-1.5 w-1.5 rounded-full p-0 bg-amber-500" />
                        )}
                        {log.level === "error" && (
                          <Badge variant="destructive" className="h-1.5 w-1.5 rounded-full p-0" />
                        )}
                        <span className="font-medium">{log.time}</span>
                      </div>
                      <p className="mt-1">{log.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              System is running normally. Backend service uptime: 5 days, 7 hours. Last automated trade: 28 minutes ago.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    </div>
  )
}
