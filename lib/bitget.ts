import CryptoJS from "crypto-js"

const BITGET_API_KEY = process.env.BITGET_API_KEY!
const BITGET_SECRET_KEY = process.env.BITGET_SECRET_KEY!
const BITGET_PASSPHRASE = process.env.BITGET_PASSPHRASE!

const BASE_URL = "https://api.bitget.com"

//
// ========== Types ==========
//
type ApiResponse<T = any> = {
  code: string
  msg?: string
  requestTime?: string
  data: T
}

type TimeResponse = string

type Balance = {
  coin: string
  available: string
  frozen: string
  locked: string
  uTime: string
}

type SymbolInfo = {
  symbol: string
  baseCoin: string
  quoteCoin: string
  minTradeAmount: string
  maxTradeAmount: string
  priceScale: number
}

type TickerData = {
  instId: string
  last: string
  open24h: string
  high24h: string
  low24h: string
  bidPr: string
  askPr: string
  bidSz: string
  askSz: string
  baseVolume: string
  quoteVolume: string
  ts: string
}

type CandleData = [string, string, string, string, string, string] // [timestamp, open, high, low, close, volume]

type OrderResponse = {
  orderId: string
  clientOid: string
}

//
// ========== Utils ==========
//
function generateSignature(timestamp: string, method: string, requestPath: string, body = "") {
  const message = timestamp + method + requestPath + body
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, BITGET_SECRET_KEY))
}

async function bitgetRequest<T = any>(
  method: string,
  endpoint: string,
  params: Record<string, any> = {},
  isPrivate = true,
): Promise<ApiResponse<T>> {
  try {
    const timestamp = Date.now().toString()
    const requestPath = endpoint.split("?")[0]
    let url = `${BASE_URL}${endpoint}`

    if (method === "GET" && Object.keys(params).length > 0 && !endpoint.includes("?")) {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
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

    const response = await fetch(url, options)
    return await response.json()
  } catch (error: any) {
    console.error("Bitget API request failed:", error)
    throw error
  }
}

//
// ========== API Methods ==========
//
export async function testConnection() {
  try {
    const publicResponse = await bitgetRequest<TimeResponse>("GET", "/api/v2/spot/public/time", {}, false)
    if (!publicResponse || publicResponse.code !== "00000") {
      return {
        success: false,
        error: "Failed to connect to Bitget public API",
        publicResponse,
      }
    }

    const privateResponse = await getAccountBalance()
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
      message: "Successfully connected to Bitget API",
      accountData: privateResponse.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Failed to connect to Bitget API",
    }
  }
}

export async function getAccountBalance() {
  return await bitgetRequest<Balance[]>("GET", "/api/v2/spot/account/assets")
}

export async function getTradingPairs() {
  return await bitgetRequest<SymbolInfo[]>("GET", "/api/v2/spot/public/symbols", {}, false)
}

export async function getMarketTicker(symbol: string) {
  return await bitgetRequest<TickerData[]>("GET", `/api/v2/spot/market/ticker?symbol=${symbol}`, {}, false)
}

export async function getKlineData(symbol: string, period: string, limit = 100) {
  return await bitgetRequest<CandleData[]>(
    "GET",
    `/api/v2/spot/market/candles?symbol=${symbol}&period=${period}&limit=${limit}`,
    {},
    false,
  )
}

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

  return await bitgetRequest<OrderResponse>("POST", "/api/v2/spot/trade/orders", params)
}

//
// ========== WebSocket ==========
//
export function initWebSocket(
  onMessage: (data: any) => void,
  symbols: string[] = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
): WebSocket {
  try {
    const ws = new WebSocket("wss://ws.bitget.com/spot/v1/stream")

    ws.onopen = () => {
      console.log("WebSocket connected")

      const args = symbols.map((symbol) => ({
        channel: "ticker",
        instId: symbol,
      }))

      ws.send(JSON.stringify({ op: "subscribe", args }))

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ op: "ping" }))
        }
      }, 20000)

      ;(ws as any).pingInterval = pingInterval
    }

    ws.onmessage = (event) => {
      if (event.data === '{"event":"pong"}') return
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error("WebSocket message parse error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket closed")
      if ((ws as any).pingInterval) {
        clearInterval((ws as any).pingInterval)
      }
      setTimeout(() => {
        console.log("Reconnecting WebSocket...")
        initWebSocket(onMessage, symbols)
      }, 5000)
    }

    return ws
  } catch (error) {
    console.error("WebSocket init failed:", error)
    return {
      close: () => {},
      send: () => {},
      readyState: WebSocket.CLOSED,
    } as WebSocket
  }
}
