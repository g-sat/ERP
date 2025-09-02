import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentBase64, filename } = body

    if (!documentBase64 || !filename) {
      return NextResponse.json(
        { error: "Document base64 and filename are required" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "payslips")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const uniqueFilename = `${filename}`
    const filePath = join(uploadsDir, uniqueFilename)

    // Convert base64 to buffer and write file
    const buffer = Buffer.from(documentBase64, "base64")
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/payslips/${uniqueFilename}`

    return NextResponse.json({
      success: true,
      message: "Payslip uploaded successfully",
      data: {
        filename: uniqueFilename,
        url: publicUrl,
        size: buffer.length,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload payslip",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
