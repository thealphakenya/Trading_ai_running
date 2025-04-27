import { NextResponse } from "next/server"
import { testConnection, getAccountBalance, getTradingPairs, getMarketTicker } from "@/lib/bitget"

export async function GET() {
  try {
    console.log("Starting comprehensive Bitget API test")

    // Step 1: Test basic connection
    console.log("Step 1: Testing basic connection")
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: "Failed to connect to Bitget API",
        details: connectionTest,
      })
    }

    console.log("Basic connection test successful")

    // Step 2: Get account balance
    console.log("Step 2: Getting account balance")
    let balanceData
    try {
      balanceData = await getAccountBalance()
      console.log("Account balance retrieved successfully")
    } catch (balanceError) {
      console.error("Failed to get account balance:", balanceError)
      return NextResponse.json({
        success: false,
        message: "Connected to Bitget API but failed to retrieve account balance",
        connectionTest,
        error: balanceError.message,
      })
    }

    // Step 3: Get trading pairs
    console.log("Step 3: Getting trading pairs")
    let tradingPairsData
    try {
      tradingPairsData = await getTradingPairs()
      console.log("Trading pairs retrieved successfully")
    } catch (pairsError) {
      console.error("Failed to get trading pairs:", pairsError)
      // Continue anyway as this is not critical
      tradingPairsData = { error: pairsError.message }
    }

    // Step 4: Get market ticker for BTC/USDT
    console.log("Step 4: Getting market ticker for BTC/USDT")
    let tickerData
    try {
      tickerData = await getMarketTicker("BTCUSDT")
      console.log("Market ticker retrieved successfully")
    } catch (tickerError) {
      console.error("Failed to get market ticker:", tickerError)
      // Continue anyway as this is not critical
      tickerData = { error: tickerError.message }
    }

    // All tests passed
    return NextResponse.json({
      success: true,
      message: "Successfully connected to Bitget API and performed all tests",
      connectionTest,
      balance: balanceData,
      tradingPairs: tradingPairsData,
      ticker: tickerData,
    })
  } catch (error) {
    console.error("Error testing Bitget connection:", error)
    return NextResponse.json({
      success: false,
      message: "Error testing Bitget connection",
      error: error.message,
    })
  }
}
