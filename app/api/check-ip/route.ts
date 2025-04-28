import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Call an IP detection service
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()

    return NextResponse.json({
      vercelOutboundIp: data.ip,
      message: "This is the IP address that Bitget would see without a proxy",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error checking IP:", error)
    return NextResponse.json(
      {
        error: "Failed to check IP address",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
