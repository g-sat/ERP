import { unlink } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename } = body

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      )
    }

    // Remove the file
    const filePath = join(
      process.cwd(),
      "public",
      "uploads",
      "payslips",
      filename
    )
    await unlink(filePath)

    return NextResponse.json({
      success: true,
      message: "Payslip file cleaned up successfully",
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json(
      {
        error: "Failed to cleanup payslip file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
