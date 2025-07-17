import { NextRequest, NextResponse } from "next/server"

// API URL from environment variables with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Request deduplication cache
const requestCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5000 // 5 seconds cache

// Helper function to get secure headers from request
async function getSecureHeaders(request: NextRequest) {
  console.log("🔒 Getting secure headers from request")

  // Get cookies from the request
  const authToken = request.cookies.get("auth-token")?.value

  // Get company ID from headers first, then cookies
  const companyIdFromHeader = request.headers.get("X-Company-Id")
  const companyIdFromCookie =
    request.cookies.get("company_id")?.value ||
    request.cookies.get("selectedCompanyId")?.value
  const companyId = companyIdFromHeader || companyIdFromCookie || ""

  // Get user ID from auth token if available
  let userId = "0"
  if (authToken) {
    try {
      const tokenPayload = JSON.parse(atob(authToken.split(".")[1]))
      userId = tokenPayload.userId || "0"
    } catch (error) {
      console.error("Error parsing auth token:", error)
    }
  } else {
    console.warn("No auth token found in cookies")
  }

  if (!companyId) {
    console.warn("No companyId found, using default")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: authToken ? `Bearer ${authToken}` : "",
    "X-Reg-Id": process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID || "",
    "X-Company-Id": companyId,
    "X-User-Id": userId,
  }

  console.log("📤 Headers being sent:", {
    ...headers,
    Authorization: headers.Authorization ? "Bearer [REDACTED]" : "",
  })

  return headers
}

// Helper function to handle errors
function handleError(error: unknown) {
  console.error("❌ Proxy error:", error)
  return NextResponse.json(
    {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  )
}

// Helper function to check cache
function getCachedResponse(url: string) {
  const cached = requestCache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("📦 Returning cached response for:", url)
    return cached.data
  }
  return null
}

// Helper function to set cache
function setCachedResponse(url: string, data: unknown) {
  requestCache.set(url, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  console.log("🚀 =================================================== 🚀")
  console.log("🚀 GET request received")
  try {
    // Clean up the path parameter by removing extra slashes
    const pathParam = request.nextUrl.pathname
      .split("/proxy/")[1]
      .replace(/\/+/g, "/")
      .replace(/\/$/, "")
    console.log("📍 Path parameter:", pathParam)

    const searchParams = new URLSearchParams(request.nextUrl.searchParams)
    console.log("🔍 Search parameters:", Object.fromEntries(searchParams))

    const url = `${API_URL}/${pathParam}`
    console.log("🌐 Full URL:", url)

    const cachedResponse = getCachedResponse(url)
    if (cachedResponse) {
      return NextResponse.json(cachedResponse)
    }

    const pageNumber = request.headers.get("X-Page-Number") || "1"
    const pageSize = request.headers.get("X-Page-Size") || "2000"
    const searchString = request.headers.get("X-Search-String") || ""
    const moduleId = request.headers.get("X-Module-Id") || "0"
    const transactionId = request.headers.get("X-Transaction-Id") || "0"
    const documentId = request.headers.get("X-Document-Id") || "0"
    const fromDate = request.headers.get("X-From-Date") || ""
    const toDate = request.headers.get("X-To-Date") || ""

    const secureHeaders = await getSecureHeaders(request)
    const headers = {
      ...secureHeaders,
      "X-Page-Number": pageNumber,
      "X-Page-Size": pageSize,
      "X-Search-String": searchString,
      "X-Module-Id": moduleId,
      "X-Transaction-Id": transactionId,
      "X-Document-Id": documentId,
      "X-From-Date": fromDate,
      "X-To-Date": toDate,
    }

    console.log("📡 Making request to API with headers:", {
      ...headers,
      Authorization: headers.Authorization ? "Bearer [REDACTED]" : "",
    })

    const response = await fetch(url, { headers })
    console.log("📥 Response status:", response.status)
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()))

    // Check if response is empty
    const responseText = await response.text()
    console.log("📥 Response text:", responseText)

    if (!responseText || responseText.trim() === "") {
      console.warn("Empty response from API, returning empty data")
      return NextResponse.json({ data: [], result: 0, message: "Empty response" })
    }

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error("Error parsing JSON from API:", jsonError)
      console.error("Raw response:", responseText)
      return NextResponse.json(
        { 
          data: [], 
          result: 0, 
          message: "Invalid JSON response from server",
          error: jsonError instanceof Error ? jsonError.message : "JSON parse error"
        },
        { status: 500 }
      )
    }

    console.log("✅ Request successful")
    setCachedResponse(url, data)
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST request received")
  try {
    const pathParam = request.nextUrl.pathname.split("/proxy/")[1]
    const url = `${API_URL}/${pathParam}`
    console.log("🌐 Full URL:", url)

    const body = await request.json()
    console.log("📦 Request body:", body)

    const headers = await getSecureHeaders(request)
    console.log("📡 Making request to API...")

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    console.log("📥 Response status:", response.status)
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()))

    // Check if response is empty
    const responseText = await response.text()
    console.log("📥 Response text:", responseText)

    if (!responseText || responseText.trim() === "") {
      console.warn("Empty response from API, returning empty data")
      return NextResponse.json({ data: [], result: 0, message: "Empty response" })
    }

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error("Error parsing JSON from API:", jsonError)
      console.error("Raw response:", responseText)
      return NextResponse.json(
        { 
          data: [], 
          result: 0, 
          message: "Invalid JSON response from server",
          error: jsonError instanceof Error ? jsonError.message : "JSON parse error"
        },
        { status: 500 }
      )
    }

    console.log("✅ Request successful")
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  console.log("🚀 PUT request received")
  try {
    const pathParam = request.nextUrl.pathname.split("/proxy/")[1]
    const url = `${API_URL}/${pathParam}`
    console.log("🌐 Full URL:", url)

    const body = await request.json()
    console.log("📦 Request body:", body)

    const headers = await getSecureHeaders(request)
    console.log("📡 Making request to API...")

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })
    console.log("📥 Response status:", response.status)

    const data = await response.json()
    console.log("✅ Request successful")
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: NextRequest) {
  console.log("🚀 DELETE request received")
  try {
    const pathParam = request.nextUrl.pathname.split("/proxy/")[1]
    const url = `${API_URL}/${pathParam}`
    console.log("🌐 Full URL:", url)

    const headers = await getSecureHeaders(request)
    console.log("📡 Making request to API...")

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    })
    console.log("📥 Response status:", response.status)

    const data = await response.json()
    console.log("✅ Request successful")
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
