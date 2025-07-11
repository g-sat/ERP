import { writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const moduleId = formData.get("moduleId") as string
    const transactionId = formData.get("transactionId") as string
    const itemNo = formData.get("itemNo") as string
    const docTypeId = formData.get("docTypeId") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create directory path
    const uploadDir = join(
      process.cwd(),
      "public",
      "company",
      "document",
      moduleId,
      transactionId,
      itemNo
    )

    // Create file path
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadDir, fileName)

    // Save file
    await writeFile(filePath, buffer)

    // Return success response with file path
    return NextResponse.json({
      success: true,
      filePath: `/company/document/${moduleId}/${transactionId}/${itemNo}/${fileName}`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}
