import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const tempPath =
      (formData.get("tempPath") as string) || "public/temp/upload"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPEG, JPG, PNG are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (7MB limit)
    if (file.size > 7 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 7MB" },
        { status: 400 }
      )
    }

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), tempPath)
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const _fileExtension = file.name.split(".").pop()
    const fileName = `${timestamp}_${file.name}`
    const filePath = join(tempDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the relative path
    const relativePath = `${tempPath}/${fileName}`

    return NextResponse.json({
      success: true,
      filePath: relativePath,
      message: "File uploaded to temp location successfully",
    })
  } catch (error) {
    console.error("Error uploading file to temp location:", error)
    return NextResponse.json(
      { error: "Failed to upload file to temp location" },
      { status: 500 }
    )
  }
}
