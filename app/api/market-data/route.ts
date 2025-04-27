import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "BTC/USD"
  const timeframe = searchParams.get("timeframe") || "1W"

  // Generate mock market data based on the requested symbol and timeframe
  const data = generateMarketData(symbol, timeframe)

  return NextResponse.json(data)
}

function generateMarketData(symbol: string, timeframe: string) {
  // Set base price depending on the asset
  let basePrice = 0
  if (symbol === "BTC/USD") basePrice = 45000
  else if (symbol === "ETH/USD") basePrice = 2800
  else if (symbol.includes("/USD"))
    basePrice = 100 // Other crypto
  else basePrice = 200 // Stocks

  // Generate dates based on timeframe
  const dates = generateDates(timeframe)

  // Generate price data with some randomness but following a trend
  const trend = Math.random() > 0.5 ? 1 : -1 // Random upward or downward trend
  const volatility = symbol.includes("/USD") ? 0.03 : 0.015 // Crypto is more volatile

  let currentPrice = basePrice
  const data = dates.map((date) => {
    // Add some random movement with trend bias
    const change = currentPrice * (Math.random() * volatility * 2 - volatility + trend * 0.005)
    currentPrice += change

    // Ensure price doesn't go negative
    if (currentPrice < 1) currentPrice = 1

    // Generate volume data
    const volume = Math.floor(basePrice * 100 * (0.5 + Math.random()))

    return {
      date,
      price: Number.parseFloat(currentPrice.toFixed(2)),
      volume,
      open: Number.parseFloat((currentPrice - Math.random() * change).toFixed(2)),
      high: Number.parseFloat((currentPrice + Math.random() * change * 0.5).toFixed(2)),
      low: Number.parseFloat((currentPrice - Math.random() * change * 0.5).toFixed(2)),
      close: Number.parseFloat(currentPrice.toFixed(2)),
    }
  })

  return {
    symbol,
    timeframe,
    data,
  }
}

function generateDates(timeframe: string) {
  const dates = []
  const now = new Date()
  let interval = 1 // days
  let count = 7 // number of data points

  // Set interval and count based on timeframe
  if (timeframe === "1D") {
    interval = 1 / 24 // hourly
    count = 24
  } else if (timeframe === "1W") {
    interval = 1 // daily
    count = 7
  } else if (timeframe === "1M") {
    interval = 1 // daily
    count = 30
  } else if (timeframe === "3M") {
    interval = 3 // every 3 days
    count = 30
  } else if (timeframe === "1Y") {
    interval = 7 // weekly
    count = 52
  }

  // Generate dates
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * interval)

    // Format date based on timeframe
    let formattedDate
    if (timeframe === "1D") {
      formattedDate = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (["1W", "1M"].includes(timeframe)) {
      formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric" })
    } else {
      formattedDate = date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    dates.push(formattedDate)
  }

  return dates
}
