import { NextResponse } from "next/server"
import crypto from "crypto"

const BITGET_API_KEY = process.env.BITGET_API_KEY!
const BITGET_API_SECRET = process.env.BITGET_API_SECRET!
const BITGET_API_PASSPHRASE = process.env.BITGET_API_PASSPHRASE!
const BASE_URL = "https://api.bitget.com"

function signRequest(timestamp: string, method: string, endpoint: string, body: string) {
  const preHash = timestamp + method + endpoint + body
  return crypto.createHmac("sha256", BITGET_API_SECRET).update(preHash).digest("base64")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { asset, type, amount, price, stopLoss, takeProfit } = body

    if (!asset || !type || !amount || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const timestamp = Date.now().toString()
    const endpoint = "/api/v1/mix/order/placeOrder"
    const url = BASE_URL + endpoint

    const requestBody = JSON.stringify({
      symbol: asset,
      marginCoin: "USDT",
      side: type.toUpperCase(), // BUY or SELL
      orderType: "limit",
      size: amount.toString(),
      price: price.toString(),
      timeInForceValue: "normal"
    })

    const sign = signRequest(timestamp, "POST", endpoint, requestBody)

    const headers = {
      "Content-Type": "application/json",
      "ACCESS-KEY": BITGET_API_KEY,
      "ACCESS-SIGN": sign,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": BITGET_API_PASSPHRASE
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: requestBody
    })

    const data = await response.json()

    if (!response.ok || data.code !== "00000") {
      return NextResponse.json(
        { error: "Bitget API error", details: data.msg || data },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: data.data.orderId,
      asset,
      type,
      amount,
      price,
      stopLoss,
      takeProfit,
      timestamp: new Date().toISOString(),
      status: "executed",
      message: `Successfully placed ${type} order for ${amount} ${asset} at $${price}`
    })
  } catch (error: any) {
    console.error("Trade error:", error)
    return NextResponse.json(
      { error: "Failed to execute trade", details: error.message },
      { status: 500 }
    )
  }
}
