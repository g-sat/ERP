"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const { switchCompany, getCurrentTabCompanyId, companies, isAuthenticated } =
    useAuthStore()
  const companyId = params.companyId as string
  React.useEffect(() => {
    // Add a small delay to allow auth store to initialize
    const timer = setTimeout(() => {
      // Only run if user is authenticated
      if (!isAuthenticated) {
        return
      }
      if (companyId) {
        // Verify the company exists in the available companies
        const companyExists = companies.some((c) => c.companyId === companyId)
        if (companyExists) {
          switchCompany(companyId)
          // Don't redirect - stay on the current page
        } else {
          router.push("/company-select")
        }
      } else {
        // No company ID in URL - only redirect if we're on a path that requires company selection
        // This should only happen on root paths or company-select page
        // Don't automatically redirect - let the specific page handle its own logic
      }
    }, 100) // Small delay to allow auth store to initialize
    return () => clearTimeout(timer)
  }, [
    companyId,
    switchCompany,
    getCurrentTabCompanyId,
    companies,
    isAuthenticated,
    router,
  ])
  return <>{children}</>
}
