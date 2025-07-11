import { NextResponse, type NextRequest } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/pdf-tools",
  "/erp-tools",
  "/ai",
  "/reports",
]

// Define auth routes that require authentication but not company selection
const authRoutes = ["/company-select"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token and selected company ID from cookies
  const token = request.cookies.get("auth-token")?.value
  const selectedCompanyId = request.cookies.get("tab_company_id")?.value

  console.log("Middleware - Current path:", pathname)
  console.log("Middleware - Token present:", !!token)
  console.log("Middleware - Company ID present:", !!selectedCompanyId)

  // If no token is present and not on a public route, redirect to login
  if (!token && !publicRoutes.includes(pathname)) {
    console.log("Middleware - No token found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If token exists but no company is selected, redirect to company select
  if (
    token &&
    !authRoutes.includes(pathname) &&
    !publicRoutes.includes(pathname)
  ) {
    // Check if the path follows the '/[companyId]/' pattern
    const pathParts = pathname.split("/")
    if (pathParts.length < 2 || !pathParts[1]) {
      console.log(
        "Middleware - No company selected, redirecting to company select"
      )
      return NextResponse.redirect(new URL("/company-select", request.url))
    }
  }

  // For public routes, allow access
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For auth routes (like company-select), allow access if token exists
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.next()
  }

  // For all other routes (e.g., /[companyId]/dashboard), allow access
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
