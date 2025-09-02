import fs from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

import { whatsappAPI } from "@/lib/whatsapp-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, message, filePath, caption, filename } = body

    console.log("body", body)

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    if (!whatsappAPI.isConfigured()) {
      return NextResponse.json(
        {
          error:
            "WhatsApp API is not configured. Please check environment variables.",
        },
        { status: 500 }
      )
    }

    let response

    if (filePath) {
      console.log("filePath", filePath)
      console.log("process.cwd()", process.cwd())

      // Handle both formats: "public/uploads/..." and "uploads/..."
      let fullPath
      if (filePath.startsWith("public/")) {
        fullPath = path.join(process.cwd(), filePath)
      } else {
        fullPath = path.join(process.cwd(), "public", filePath)
      }

      console.log("fullPath:", fullPath)

      if (!fs.existsSync(fullPath)) {
        console.log("File does not exist at:", fullPath)
        return NextResponse.json(
          {
            error: "File not found",
            details: {
              providedPath: filePath,
              fullPath: fullPath,
              currentWorkingDir: process.cwd(),
            },
          },
          { status: 404 }
        )
      }

      console.log(
        "Formatted phone number:",
        whatsappAPI.formatPhoneNumber(phoneNumber)
      )
      console.log("Sending PDF document with caption:", caption)
      console.log("Filename:", filename)

      // Send PDF document using Media API (upload + send)
      response = await whatsappAPI.sendPDFDocument(
        whatsappAPI.formatPhoneNumber(phoneNumber),
        fullPath,
        caption,
        filename
      )
    } else if (message) {
      console.log("message", message)
      // Send text message
      response = await whatsappAPI.sendTextMessage(
        whatsappAPI.formatPhoneNumber(phoneNumber),
        message
      )
    } else {
      console.log("Either message or filePath is required")
      return NextResponse.json(
        { error: "Either message or filePath is required" },
        { status: 400 }
      )
    }

    console.log("response", response)

    return NextResponse.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: response,
    })
  } catch (error) {
    console.error("WhatsApp API error:", error)

    // Provide more detailed error information
    let errorMessage = "Failed to send WhatsApp message"
    let errorDetails = "Unknown error"

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || "No stack trace available"
    }

    // Log detailed error for debugging
    console.error("Detailed error:", {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
