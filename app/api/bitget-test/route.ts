import { NextResponse } from "next/server"
import { testConnection } from "@/lib/bitget-client"

export async function GET() {
  try {
    const result = await testConnection()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to Bitget API",
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Bitget API through proxy",
      data: result.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing Bitget connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing Bitget connection",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
