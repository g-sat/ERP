import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const moduleId = formData.get("moduleId") as string
    const transactionId = formData.get("transactionId") as string
    const itemNo = formData.get("itemNo") as string
    const companyId = formData.get("companyId") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Define modules that use companyId
    const modulesWithCompanyId = ["ar", "ap", "cb", "gl", "common"]

    // Create directory path based on module type
    let uploadDir: string
    let relativePath: string

    if (modulesWithCompanyId.includes(moduleId)) {
      // Modules that use companyId
      if (!companyId) {
        return NextResponse.json(
          { error: "Company ID required for this module" },
          { status: 400 }
        )
      }

      uploadDir = join(
        process.cwd(),
        "public",
        "documents",
        companyId,
        moduleId,
        transactionId || "0",
        itemNo || "1"
      )

      relativePath = `/documents/${companyId}/${moduleId}/${transactionId || "0"}/${itemNo || "1"}`
    } else {
      // Modules that don't use companyId (like document-expiry)
      uploadDir = join(process.cwd(), "public", "documents", moduleId)

      relativePath = `/documents/${moduleId}`
    }

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Create file path with better naming
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split(".").pop()
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
      moduleType: modulesWithCompanyId.includes(moduleId)
        ? "with-company"
        : "without-company",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}
