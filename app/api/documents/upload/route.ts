import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

import {
  APTransactionId,
  ARTransactionId,
  AdminTransactionId,
  CBTransactionId,
  GLTransactionId,
  HRTransactionId,
  MasterTransactionId,
  ModuleId,
  OperationsTransactionId,
  SettingTransactionId,
} from "@/lib/utils"

// Helper function to get module name from moduleId
function getModuleName(moduleId: number): string {
  const moduleEntries = Object.entries(ModuleId)
  const moduleEntry = moduleEntries.find(
    ([key, value]) => isNaN(Number(key)) && value === moduleId
  )
  return moduleEntry ? moduleEntry[0] : "unknown"
}

// Helper function to get transaction name from transactionId and moduleId
function getTransactionName(transactionId: number, moduleId: number): string {
  let transactionEnum: Record<string, number> = {}

  switch (moduleId) {
    case ModuleId.ar:
      transactionEnum = ARTransactionId as unknown as Record<string, number>
      break
    case ModuleId.ap:
      transactionEnum = APTransactionId as unknown as Record<string, number>
      break
    case ModuleId.cb:
      transactionEnum = CBTransactionId as unknown as Record<string, number>
      break
    case ModuleId.gl:
      transactionEnum = GLTransactionId as unknown as Record<string, number>
      break
    case ModuleId.master:
      transactionEnum = MasterTransactionId as unknown as Record<string, number>
      break
    case ModuleId.operations:
      transactionEnum = OperationsTransactionId as unknown as Record<
        string,
        number
      >
      break
    case ModuleId.admin:
      transactionEnum = AdminTransactionId as unknown as Record<string, number>
      break
    case ModuleId.setting:
      transactionEnum = SettingTransactionId as unknown as Record<
        string,
        number
      >
      break
    case ModuleId.hr:
      transactionEnum = HRTransactionId as unknown as Record<string, number>
      break
    default:
      return "unknown"
  }

  const transactionEntries = Object.entries(transactionEnum)
  const transactionEntry = transactionEntries.find(
    ([key, value]) => isNaN(Number(key)) && value === transactionId
  )
  return transactionEntry ? transactionEntry[0] : "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const moduleId = parseInt(formData.get("moduleId") as string)
    const transactionId = parseInt(formData.get("transactionId") as string)
    const documentId = formData.get("documentId") as string
    const companyId = formData.get("companyId") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Define modules that use companyId
    const modulesWithCompanyId = [
      ModuleId.ar,
      ModuleId.ap,
      ModuleId.cb,
      ModuleId.gl,
      ModuleId.operations,
    ]

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

      // Get module name and transaction name from IDs
      const moduleName = getModuleName(moduleId)
      const transactionName = getTransactionName(transactionId, moduleId)

      uploadDir = join(
        process.cwd(),
        "public",
        "documents",
        companyId,
        moduleName,
        transactionName,
        documentId
      )

      relativePath = `/documents/${companyId}/${moduleName}/${transactionName}/${documentId}`
    } else {
      // Modules that don't use companyId (like document-expiry)
      const moduleName = getModuleName(moduleId)
      uploadDir = join(process.cwd(), "public", "documents", moduleName)

      relativePath = `/documents/${moduleName}`
    }

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Create file path with better naming and sanitize file name
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split(".").pop()?.toLowerCase() || ""

    // Sanitize file name: remove/replace problematic characters
    // Keep only alphanumeric, dash, underscore, and dot characters
    // Replace spaces and special characters with underscores
    let sanitizedName = originalName
      .replace(`.${extension}`, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single
      .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores

    // Ensure file name is not empty
    if (!sanitizedName) {
      sanitizedName = "file"
    }

    // Limit file name length to avoid filesystem issues (max 255 chars total)
    const maxBaseNameLength = 200
    if (sanitizedName.length > maxBaseNameLength) {
      sanitizedName = sanitizedName.substring(0, maxBaseNameLength)
    }

    const fileName = `${timestamp}-${sanitizedName}.${extension}`
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
