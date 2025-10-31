import { existsSync, unlink } from "fs"
import { unlink as unlinkPromise } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join("/")
    const fullPath = join(process.cwd(), "public", "documents", filePath)

    // Security check - ensure path is within documents directory
    if (!fullPath.startsWith(join(process.cwd(), "public", "documents"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete file
    await unlinkPromise(fullPath)

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      filePath: filePath,
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
