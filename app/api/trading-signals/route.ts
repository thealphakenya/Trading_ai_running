import { NextResponse } from "next/server"

// This would typically connect to a real AI model or trading API
// For demo purposes, we're generating mock data
export async function GET() {
  // Mock data for trading signals
  const assets = ["BTC/USD", "ETH/USD", "SOL/USD", "AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META"]
  const signals = ["Buy", "Sell", "Hold"]

  const mockSignals = assets.map((asset) => {
    const signal = signals[Math.floor(Math.random() * signals.length)]
    const confidence = Math.floor(Math.random() * 30) + 60 // 60-90%
    const price = asset.includes("/USD")
      ? Math.random() * 50000 + 1000 // Crypto prices
      : Math.random() * 500 + 50 // Stock prices
    const change = (Math.random() * 6 - 3).toFixed(2) // -3% to +3%

    return {
      asset,
      signal,
      confidence,
      price: Number.parseFloat(price.toFixed(2)),
      change: Number.parseFloat(change),
      timestamp: new Date().toISOString(),
    }
  })

  return NextResponse.json({ signals: mockSignals })
}
