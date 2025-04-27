import CryptoJS from "crypto-js"

// Victor's Bitget credentials
const BITGET_API_KEY = "bg_1d7ea7c56644fb5da18a400c92a425d7"
const BITGET_SECRET_KEY = "e9121c2f6018c6844dd631a35583d4113fcfb1b2a8d3761c0ea430ea8fae7d13"
const BITGET_PASSPHRASE = "Victor9798"

const BASE_URL = "https://api.bitget.com"

// Generate signature for Bitget API
function generateSignature(timestamp: string, method: string, requestPath: string, body = "") {
  // Bitget requires the message to be timestamp + method + requestPath + body
  const message = timestamp + method + requestPath + body
  // Use HMAC-SHA256 to generate the signature and encode it as Base64
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, BITGET_SECRET_KEY))
}

// Make a request to Bitget API
export async function bitgetRequest(
  method: string,
  endpoint: string,
  params: Record<string, any> = {},
  isPrivate = true,
) {
  try {
    console.log(`Making Bitget API request: ${method} ${endpoint}`)

    const timestamp = Date.now().toString()
    // Extract the base path without query parameters
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
      // For private endpoints, we need to add authentication headers
      const body = method === "POST" ? JSON.stringify(params) : ""
      const signature = generateSignature(timestamp, method, requestPath, body)

      headers["ACCESS-KEY"] = BITGET_API_KEY
      headers["ACCESS-SIGN"] = signature
      headers["ACCESS-TIMESTAMP"] = timestamp
      headers["ACCESS-PASSPHRASE"] = BITGET_PASSPHRASE
    }

    console.log("Request URL:", url)
    console.log("Request headers:", JSON.stringify(headers))

    if (method === "POST") {
      console.log("Request body:", JSON.stringify(params))
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (method === "POST" && Object.keys(params).length > 0) {
      options.body = JSON.stringify(params)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    console.log("Bitget API response:", JSON.stringify(data))

    return data
  } catch (error) {
    console.error("Bitget API request failed:", error)
    throw error
  }
}

// Test connection to Bitget API
export async function testConnection() {
  try {
    console.log("Testing connection to Bitget API")

    // First try a public endpoint that doesn't require authentication
    const publicResponse = await bitgetRequest("GET", "/api/v2/spot/public/time", {}, false)
    console.log("Public API test response:", publicResponse)

    if (!publicResponse || publicResponse.code !== "00000") {
      return {
        success: false,
        error: "Failed to connect to Bitget public API",
        publicResponse,
      }
    }

    // Then try a private endpoint that requires authentication
    const privateResponse = await getAccountBalance()
    console.log("Private API test response:", privateResponse)

    if (!privateResponse || privateResponse.code !== "00000") {
      return {
        success: false,
        error: "Failed to authenticate with Bitget API",
        publicSuccess: true,
        privateResponse,
      }
    }

    return {
      success: true,
      timestamp: publicResponse.data,
      message: "Successfully connected to Bitget API and authenticated",
      accountData: privateResponse.data,
    }
  } catch (error) {
    console.error("Failed to connect to Bitget API:", error)
    return {
      success: false,
      error: error.message,
      message: "Failed to connect to Bitget API",
    }
  }
}

// Get account balance
export async function getAccountBalance() {
  try {
    console.log("Getting account balance from Bitget")
    return await bitgetRequest("GET", "/api/v2/spot/account/assets")
  } catch (error) {
    console.error("Failed to get account balance:", error)
    throw error
  }
}

// Get trading pairs
export async function getTradingPairs() {
  try {
    console.log("Getting trading pairs from Bitget")
    return await bitgetRequest("GET", "/api/v2/spot/public/symbols", {}, false)
  } catch (error) {
    console.error("Failed to get trading pairs:", error)
    throw error
  }
}

// Get market ticker
export async function getMarketTicker(symbol: string) {
  try {
    console.log(`Getting market ticker for ${symbol} from Bitget`)
    return await bitgetRequest("GET", `/api/v2/spot/market/ticker?symbol=${symbol}`, {}, false)
  } catch (error) {
    console.error(`Failed to get market ticker for ${symbol}:`, error)
    throw error
  }
}

// Get historical candle data
export async function getKlineData(symbol: string, period: string, limit = 100) {
  try {
    console.log(`Getting kline data for ${symbol} (${period}) from Bitget`)
    return await bitgetRequest(
      "GET",
      `/api/v2/spot/market/candles?symbol=${symbol}&period=${period}&limit=${limit}`,
      {},
      false,
    )
  } catch (error) {
    console.error(`Failed to get kline data for ${symbol}:`, error)
    throw error
  }
}

// Place an order
export async function placeOrder(
  symbol: string,
  side: "buy" | "sell",
  orderType: "limit" | "market",
  size: string,
  price?: string,
) {
  try {
    console.log(`Placing ${side} order for ${symbol} on Bitget`)

    const params: Record<string, any> = {
      symbol,
      side,
      orderType,
      size,
    }

    if (orderType === "limit" && price) {
      params.price = price
    }

    return await bitgetRequest("POST", "/api/v2/spot/trade/orders", params)
  } catch (error) {
    console.error(`Failed to place order for ${symbol}:`, error)
    throw error
  }
}

// Initialize WebSocket connection
export function initWebSocket(onMessage: (data: any) => void) {
  try {
    console.log("Initializing Bitget WebSocket connection")
    const ws = new WebSocket("wss://ws.bitget.com/spot/v1/stream")

    ws.onopen = () => {
      console.log("WebSocket connected")

      // Keep connection alive with ping
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ op: "ping" }))
        }
      }, 20000)

      // Subscribe to tickers
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [
            {
              channel: "ticker",
              instId: "BTCUSDT",
            },
            {
              channel: "ticker",
              instId: "ETHUSDT",
            },
            {
              channel: "ticker",
              instId: "SOLUSDT",
            },
          ],
        }),
      )(
        // Store the interval ID so we can clear it when the connection closes
        ws as any,
      ).pingInterval = pingInterval
    }

    ws.onmessage = (event) => {
      try {
        // Handle pong response
        if (event.data === '{"event":"pong"}') {
          console.log("Received pong from WebSocket")
          return
        }

        const data = JSON.parse(event.data)
        console.log("WebSocket message received:", data)
        onMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket closed")

      // Clear the ping interval
      if ((ws as any).pingInterval) {
        clearInterval((ws as any).pingInterval)
      }

      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log("Attempting to reconnect WebSocket")
        initWebSocket(onMessage)
      }, 5000)
    }

    return ws
  } catch (error) {
    console.error("Failed to initialize WebSocket:", error)

    // Return a dummy WebSocket object that won't cause errors if methods are called on it
    return {
      close: () => {},
      send: () => {},
      readyState: WebSocket.CLOSED,
    } as WebSocket
  }
}
