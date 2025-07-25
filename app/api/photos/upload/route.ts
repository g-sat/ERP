import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const photoType = formData.get("photoType") as string // "employee" or "profile"
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!photoType || !["employee", "profile"].includes(photoType)) {
      return NextResponse.json({ error: "Invalid photo type" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create directory path based on photo type
    let uploadDir: string
    let relativePath: string

    if (photoType === "employee") {
      uploadDir = join(process.cwd(), "public", "uploads", "employee")
      relativePath = "/uploads/employee"
    } else {
      // profile type
      uploadDir = join(process.cwd(), "public", "uploads", "avatars")
      relativePath = "/uploads/avatars"
    }

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Create file path with better naming
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split(".").pop()?.toLowerCase() || "jpg"
    const baseName = originalName.replace(`.${extension}`, "")
    const fileName = `${timestamp}-${baseName}.${extension}`
    const filePath = join(uploadDir, fileName)

    // Save file
    await writeFile(filePath, buffer)

    // Return success response with file path
    const fullRelativePath = `${relativePath}/${fileName}`

    return NextResponse.json({
      success: true,
      filePath: fullRelativePath,
      fileName: originalName,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      photoType: photoType,
    })
  } catch (error) {
    console.error("Photo upload error:", error)
    return NextResponse.json(
      { error: "Error uploading photo" },
      { status: 500 }
    )
  }
}
