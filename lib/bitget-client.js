import crypto from "crypto"

// Base URL points to your proxy server instead of directly to Bitget
const BASE_URL = process.env.PROXY_URL || "https://your-proxy-server.com/bitget"
const PROXY_USERNAME = process.env.PROXY_USERNAME || "your_username"
const PROXY_PASSWORD = process.env.PROXY_PASSWORD || "your_secure_password"

// Bitget API credentials
const API_KEY = process.env.BITGET_API_KEY
const API_SECRET = process.env.BITGET_SECRET_KEY
const PASSPHRASE = process.env.BITGET_PASSPHRASE

/**
 * Makes a request to Bitget API through the proxy server
 */
export async function bitgetRequest(method, endpoint, params = {}) {
  try {
    const timestamp = Date.now().toString()
    const requestPath = endpoint.includes("?") ? endpoint.split("?")[0] : endpoint

    // Generate signature for Bitget
    let body = ""
    if (method === "POST" && Object.keys(params).length > 0) {
      body = JSON.stringify(params)
    }

    const message = timestamp + method + requestPath + body
    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("base64")

    // Create Basic Auth header for proxy authentication
    const basicAuth = "Basic " + Buffer.from(`${PROXY_USERNAME}:${PROXY_PASSWORD}`).toString("base64")

    // Prepare URL
    let url = `${BASE_URL}${endpoint}`
    if (method === "GET" && Object.keys(params).length > 0 && !endpoint.includes("?")) {
      const queryString = new URLSearchParams(params).toString()
      url = `${url}?${queryString}`
    }

    // Prepare headers
    const headers = {
      Authorization: basicAuth,
      "ACCESS-KEY": API_KEY,
      "ACCESS-SIGN": signature,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": PASSPHRASE,
      "Content-Type": "application/json",
    }

    // Make the request
    const options = {
      method,
      headers,
    }

    if (method === "POST" && Object.keys(params).length > 0) {
      options.body = JSON.stringify(params)
    }

    console.log(`Making ${method} request to ${url}`)
    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Bitget API request failed:", error)
    throw error
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance() {
  return bitgetRequest("GET", "/api/v2/spot/account/assets")
}

/**
 * Test connection to Bitget API
 */
export async function testConnection() {
  try {
    const response = await getAccountBalance()
    return {
      success: true,
      data: response,
      message: "Successfully connected to Bitget API through proxy",
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to connect to Bitget API",
    }
  }
}
