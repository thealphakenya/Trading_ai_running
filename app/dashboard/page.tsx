"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, CreditCard, ArrowUp, ArrowDown, Brain, AlertCircle } from "lucide-react"
import { ChartContainer, ChartTooltipContent } from "@/components/ChartContainer"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [currentConfidence, setCurrentConfidence] = useState<number>(75)
  const [confidenceThreshold] = useState<number>(70)
  const [bitgetConnected, setBitgetConnected] = useState<boolean>(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user])

  useEffect(() => {
    // Fetch recent trades from API
    const fetchRecentTrades = async () => {
      try {
        const response = await fetch("/api/recent-trades") // Replace with your API endpoint
        const data = await response.json()
        setRecentTrades(data)
      } catch (error) {
        console.error("Error fetching recent trades:", error)
      }
    }

    // Fetch system logs from API
    const fetchSystemLogs = async () => {
      try {
        const response = await fetch("/api/system-logs") // Replace with your API endpoint
        const data = await response.json()
        setSystemLogs(data)
      } catch (error) {
        console.error("Error fetching system logs:", error)
      }
    }

    // Call the fetch functions on component mount
    fetchRecentTrades()
    fetchSystemLogs()
  }, [])

  useEffect(() => {
    // Verify Bitget connection
    const verifyBitgetConnection = async () => {
      try {
        const response = await fetch("/api/bitget/test-connection");
        const data = await response.json();
        setBitgetConnected(data.success);
      } catch (error) {
        console.error("Error verifying Bitget connection:", error);
        setBitgetConnected(false);
      }
    };

    verifyBitgetConnection();
  }, []);

  if (loading) return <p>Loading...</p>

  if (!bitgetConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Unable to connect to Bitget. Please check your API credentials.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Confidence Score */}
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
                      data={[{ time: "09:00", confidence: 65 }, { time: "10:00", confidence: 68 }, { time: "11:00", confidence: 72 }, { time: "12:00", confidence: 75 }, { time: "13:00", confidence: 73 }, { time: "14:00", confidence: 69 }, { time: "15:00", confidence: 74 }, { time: "16:00", confidence: 78 }, { time: "17:00", confidence: currentConfidence }]}
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

            {/* Other Components */}
            {/* Recent Trades and System Logs will follow similarly */}
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
