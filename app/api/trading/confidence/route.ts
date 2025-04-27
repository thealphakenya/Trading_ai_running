import { NextResponse } from "next/server"

// This would typically connect to a real AI model
// For demo purposes, we're generating mock data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const asset = searchParams.get("asset") || "BTC/USDT"

  // Generate a confidence score between 50-95
  // In a real implementation, this would use an AI model to analyze market data
  const confidence = generateConfidenceScore(asset)

  // Generate signals based on confidence
  const signal = confidence >= 75 ? "buy" : confidence <= 40 ? "sell" : "hold"

  // Add some analysis factors that contributed to the score
  const factors = generateAnalysisFactors(asset, confidence, signal)

  return NextResponse.json({
    asset,
    confidence,
    signal,
    timestamp: new Date().toISOString(),
    factors,
    threshold: 70, // Default threshold
  })
}

function generateConfidenceScore(asset: string) {
  // Base confidence with some randomness
  let baseConfidence = 65

  // Add some asset-specific bias
  if (asset === "BTC/USDT") baseConfidence += 5
  if (asset === "ETH/USDT") baseConfidence += 3

  // Add randomness (±15)
  const randomFactor = Math.floor(Math.random() * 30) - 15

  // Calculate final confidence and ensure it's between 30-95
  const finalConfidence = Math.min(Math.max(baseConfidence + randomFactor, 30), 95)

  return finalConfidence
}

function generateAnalysisFactors(asset: string, confidence: number, signal: string) {
  // These would be the actual factors the AI model considered
  const factors = [
    {
      name: "Price Action",
      impact: Math.random() > 0.5 ? "positive" : "negative",
      weight: Math.floor(Math.random() * 30) + 10,
      description:
        signal === "buy"
          ? "Bullish pattern detected in recent price movements"
          : signal === "sell"
            ? "Bearish divergence observed in price structure"
            : "Sideways consolidation pattern detected",
    },
    {
      name: "Volume Analysis",
      impact: confidence > 70 ? "positive" : "negative",
      weight: Math.floor(Math.random() * 25) + 5,
      description:
        confidence > 70
          ? "Increasing volume supporting price direction"
          : "Decreasing volume indicating potential reversal",
    },
    {
      name: "Market Sentiment",
      impact: Math.random() > 0.4 ? "positive" : "negative",
      weight: Math.floor(Math.random() * 20) + 10,
      description:
        Math.random() > 0.4 ? "Positive sentiment in social media and news" : "Mixed or negative sentiment detected",
    },
    {
      name: "Technical Indicators",
      impact: confidence > 60 ? "positive" : "negative",
      weight: Math.floor(Math.random() * 35) + 15,
      description:
        confidence > 60
          ? "Multiple indicators showing bullish signals (MACD, RSI)"
          : "Conflicting signals from technical indicators",
    },
  ]

  return factors
}
