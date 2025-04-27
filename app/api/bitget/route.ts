import { NextResponse } from "next/server"
import CryptoJS from "crypto-js"

// Victor's Bitget credentials
const BITGET_API_KEY = "bg_1d7ea7c56644fb5da18a400c92a425d7"
const BITGET_SECRET_KEY = "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13"
const BITGET_PASSPHRASE = "Victor9798"

const BASE_URL = "https://api.bitget.com"

// Generate signature for Bitget API
function generateSignature(timestamp: string, method: string, requestPath: string, body = "") {
  const message = timestamp + method + requestPath + body
  const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, BITGET_SECRET_KEY))
  return signature
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 })
  }

  try {
    const timestamp = Date.now().toString()
    const requestPath = endpoint.includes("?") ? endpoint.split("?")[0] : endpoint

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ACCESS-KEY": BITGET_API_KEY,
      "ACCESS-SIGN": generateSignature(timestamp, "GET", requestPath),
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": BITGET_PASSPHRASE,
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error calling Bitget API:", error)
    return NextResponse.json({ error: "Failed to call Bitget API" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, params } = body

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 })
    }

    const timestamp = Date.now().toString()
    const requestPath = endpoint
    const bodyStr = JSON.stringify(params || {})

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ACCESS-KEY": BITGET_API_KEY,
      "ACCESS-SIGN": generateSignature(timestamp, "POST", requestPath, bodyStr),
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": BITGET_PASSPHRASE,
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: bodyStr,
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error calling Bitget API:", error)
    return NextResponse.json({ error: "Failed to call Bitget API" }, { status: 500 })
  }
}
