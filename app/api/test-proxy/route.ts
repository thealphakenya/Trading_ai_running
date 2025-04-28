import { NextResponse } from "next/server"

export async function GET() {
  try {
    const PROXY_URL = process.env.PROXY_URL || "http://your-vps-ip:3000"
    const PROXY_USERNAME = process.env.PROXY_USERNAME || "your_username"
    const PROXY_PASSWORD = process.env.PROXY_PASSWORD || "your_password"

    // Basic auth header
    const basicAuth = "Basic " + Buffer.from(`${PROXY_USERNAME}:${PROXY_PASSWORD}`).toString("base64")

    // Call an IP detection service through your proxy
    const response = await fetch(`${PROXY_URL}/ip-check`, {
      headers: {
        Authorization: basicAuth,
      },
    })

    if (!response.ok) {
      throw new Error(`Proxy request failed with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      proxyIp: data.ip,
      message: "This is the IP address that will be seen by Bitget when using the proxy",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing proxy:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test proxy",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
