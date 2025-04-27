import { NextResponse } from "next/server"
import { testConnection, getAccountBalance } from "@/lib/bitget"

export async function GET() {
  try {
    // First test the connection
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to Bitget API",
          error: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // If connection is successful, try to get account balance
    try {
      const balanceData = await getAccountBalance()

      return NextResponse.json({
        success: true,
        connection: connectionTest,
        balance: balanceData,
        message: "Successfully connected to Bitget API and retrieved account balance",
      })
    } catch (balanceError) {
      return NextResponse.json(
        {
          success: false,
          connection: connectionTest,
          message: "Connected to Bitget API but failed to retrieve account balance",
          error: balanceError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing Bitget connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing Bitget connection",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
