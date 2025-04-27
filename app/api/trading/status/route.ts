import { NextResponse } from "next/server"

export async function GET() {
  // In a real implementation, this would check the status of the trading service
  // For demo purposes, we're generating mock data

  const uptime = Math.floor(Math.random() * 30) + 1 // 1-30 days
  const uptimeHours = Math.floor(Math.random() * 24) // 0-23 hours

  const lastTrade = Math.floor(Math.random() * 120) // 0-120 minutes ago

  const status = Math.random() > 0.9 ? "warning" : "online" // 10% chance of warning

  const warnings =
    status === "warning"
      ? [
          {
            type: "performance",
            message: "High latency detected in API calls",
            timestamp: new Date().toISOString(),
          },
        ]
      : []

  const tradingEnabled = Math.random() > 0.2 // 80% chance of being enabled

  const activeTradesCount = Math.floor(Math.random() * 5) // 0-4 active trades

  return NextResponse.json({
    status,
    uptime: {
      days: uptime,
      hours: uptimeHours,
      total: `${uptime} days, ${uptimeHours} hours`,
    },
    lastTrade: {
      minutesAgo: lastTrade,
      timestamp: new Date(Date.now() - lastTrade * 60 * 1000).toISOString(),
    },
    tradingEnabled,
    activeTradesCount,
    warnings,
    systemLoad: Math.floor(Math.random() * 80) + 20, // 20-100%
    memoryUsage: Math.floor(Math.random() * 70) + 30, // 30-100%
    lastHealthCheck: new Date().toISOString(),
  })
}
