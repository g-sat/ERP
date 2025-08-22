import { existsSync } from "fs"
import { unlink } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: "filePath is required" },
        { status: 400 }
      )
    }

    const fullPath = join(process.cwd(), filePath)

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File does not exist" },
        { status: 404 }
      )
    }

    // Delete the file
    await unlink(fullPath)

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting temp file:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
