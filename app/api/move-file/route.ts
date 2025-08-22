import { existsSync } from "fs"
import { mkdir, rename } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fromPath, toPath } = await request.json()

    if (!fromPath || !toPath) {
      return NextResponse.json(
        { error: "fromPath and toPath are required" },
        { status: 400 }
      )
    }

    const fromFullPath = join(process.cwd(), fromPath)
    const toFullPath = join(process.cwd(), toPath)

    // Check if source file exists
    if (!existsSync(fromFullPath)) {
      return NextResponse.json(
        { error: "Source file does not exist" },
        { status: 404 }
      )
    }

    // Create destination directory if it doesn't exist
    const toDir = join(process.cwd(), "public/documents/upload")
    if (!existsSync(toDir)) {
      await mkdir(toDir, { recursive: true })
    }

    // Move file from temp to final location
    await rename(fromFullPath, toFullPath)

    return NextResponse.json({
      success: true,
      message: "File moved successfully",
      finalPath: toPath,
    })
  } catch (error) {
    console.error("Error moving file:", error)
    return NextResponse.json({ error: "Failed to move file" }, { status: 500 })
  }
}
