import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL

// Helper function to get secure headers from session and cookies
async function getSecureHeaders(request: NextRequest) {
  // Get auth token from cookies
  const authToken = request.cookies.get("auth-token")?.value
  // Get company ID from session-based header only
  const companyId = request.headers.get("X-Company-Id") || ""

  // Extract user ID from JWT token
  let userId = "0"
  if (authToken) {
    try {
      const tokenPayload = JSON.parse(atob(authToken.split(".")[1]))
      userId = tokenPayload.userId || tokenPayload.sub || "0"
    } catch (error) {
      console.error("Error parsing auth token:", error)
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: authToken ? `Bearer ${authToken}` : "",
    "X-Reg-Id": process.env.NEXT_PUBLIC_DEFAULT_REGISTRATION_ID || "",
    "X-Company-Id": companyId,
    "X-User-Id": userId,
  }
}

// Helper function to build query string from request parameters
function buildQueryString(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const queryParams = new URLSearchParams()

  // Add all query parameters to the backend request
  searchParams.forEach((value, key) => {
    if (value) {
      queryParams.append(key, value)
    }
  })

  return queryParams.toString()
}

// Handle errors
function handleError(error: unknown) {
  console.error("Proxy error:", error)
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  )
}

// GET handler
export async function GET(request: NextRequest) {
  try {
    const pathParam =
      request.nextUrl.pathname.split("/proxy/")[1]?.replace(/\/+/g, "/") || ""

    // Build query string from request parameters
    const queryString = buildQueryString(request)
    const url = queryString
      ? `${BACKEND_API_URL}/${pathParam}?${queryString}`
      : `${BACKEND_API_URL}/${pathParam}`

    const headers = await getSecureHeaders(request)

    const response = await fetch(url, { headers })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET Error:", error)
    return handleError(error)
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const pathParam =
      request.nextUrl.pathname.split("/proxy/")[1]?.replace(/\/+/g, "/") || ""
    const url = `${BACKEND_API_URL}/${pathParam}`
    const body = await request.json()
    const headers = await getSecureHeaders(request)

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("POST Error:", error)
    return handleError(error)
  }
}

// PUT handler
export async function PUT(request: NextRequest) {
  try {
    const pathParam =
      request.nextUrl.pathname.split("/proxy/")[1]?.replace(/\/+/g, "/") || ""
    const url = `${BACKEND_API_URL}/${pathParam}`
    const body = await request.json()
    const headers = await getSecureHeaders(request)

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("PUT Error:", error)
    return handleError(error)
  }
}

// DELETE handler
export async function DELETE(request: NextRequest) {
  try {
    const pathParam =
      request.nextUrl.pathname.split("/proxy/")[1]?.replace(/\/+/g, "/") || ""
    const url = `${BACKEND_API_URL}/${pathParam}`
    const headers = await getSecureHeaders(request)

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    })
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("DELETE Error:", error)
    return handleError(error)
  }
}
