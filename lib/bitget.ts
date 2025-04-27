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

// Make a request to Bitget API
export async function bitgetRequest(
  method: string,
  endpoint: string,
  params: Record<string, any> = {},
  isPrivate = true,
) {
  const timestamp = Date.now().toString()
  const requestPath = endpoint.includes("?") ? endpoint.split("?")[0] : endpoint

  let url = `${BASE_URL}${endpoint}`

  // For GET requests with params, add them to the URL
  if (method === "GET" && Object.keys(params).length > 0 && !endpoint.includes("?")) {
    const queryString = new URLSearchParams(params).toString()
    url = `${url}?${queryString}`
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (isPrivate) {
    const body = method === "POST" ? JSON.stringify(params) : ""
    const signature = generateSignature(timestamp, method, requestPath, body)

    headers["ACCESS-KEY"] = BITGET_API_KEY
    headers["ACCESS-SIGN"] = signature
    headers["ACCESS-TIMESTAMP"] = timestamp
    headers["ACCESS-PASSPHRASE"] = BITGET_PASSPHRASE
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (method === "POST" && Object.keys(params).length > 0) {
    options.body = JSON.stringify(params)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Bitget API request failed:", error)
    throw error
  }
}

// Get account balance
export async function getAccountBalance() {
  return bitgetRequest("GET", "/api/v2/spot/account/assets")
}

// Get trading pairs
export async function getTradingPairs() {
  return bitgetRequest("GET", "/api/v2/spot/public/symbols", {}, false)
}

// Get market ticker
export async function getMarketTicker(symbol: string) {
  return bitgetRequest("GET", `/api/v2/spot/market/ticker?symbol=${symbol}`, {}, false)
}

// Get historical candle data
export async function getKlineData(symbol: string, period: string, limit = 100) {
  return bitgetRequest("GET", `/api/v2/spot/market/candles?symbol=${symbol}&period=${period}&limit=${limit}`, {}, false)
}

// Place an order
export async function placeOrder(
  symbol: string,
  side: "buy" | "sell",
  orderType: "limit" | "market",
  size: string,
  price?: string,
) {
  const params: Record<string, any> = {
    symbol,
    side,
    orderType,
    size,
  }

  if (orderType === "limit" && price) {
    params.price = price
  }

  return bitgetRequest("POST", "/api/v2/spot/trade/orders", params)
}

// Initialize WebSocket connection
export function initWebSocket(onMessage: (data: any) => void) {
  const ws = new WebSocket("wss://ws.bitget.com/v2/ws/public")

  ws.onopen = () => {
    console.log("WebSocket connection established")

    // Keep connection alive with ping
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping")
      }
    }, 30000)

    // Subscribe to BTC/USDT ticker
    const subscribeMsg = {
      op: "subscribe",
      args: [
        {
          instType: "SPOT",
          channel: "ticker",
          instId: "BTCUSDT",
        },
        {
          instType: "SPOT",
          channel: "candle1m",
          instId: "BTCUSDT",
        },
      ],
    }

    ws.send(JSON.stringify(subscribeMsg))
  }

  ws.onmessage = (event) => {
    if (event.data === "pong") {
      return
    }

    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error("Error parsing WebSocket message:", error)
    }
  }

  ws.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  ws.onclose = () => {
    console.log("WebSocket connection closed")
    // Reconnect after a delay
    setTimeout(() => initWebSocket(onMessage), 5000)
  }

  return ws
}
