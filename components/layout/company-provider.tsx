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
        console.log("CompanyProvider: Not authenticated, skipping")
        return
      }

      console.log("CompanyProvider: Current companyId from URL:", companyId)
      console.log("CompanyProvider: Current path:", window.location.pathname)

      if (companyId) {
        // Verify the company exists in the available companies
        const companyExists = companies.some((c) => c.companyId === companyId)
        if (companyExists) {
          console.log(
            "CompanyProvider: Switching to company from URL:",
            companyId
          )
          switchCompany(companyId)
          // Don't redirect - stay on the current page
        } else {
          console.log(
            "CompanyProvider: Company not found in available companies, redirecting to company select"
          )
          router.push("/company-select")
        }
      } else {
        // No company ID in URL - only redirect if we're on a path that requires company selection
        // This should only happen on root paths or company-select page
        console.log(
          "CompanyProvider: No company ID in URL, but this might be intentional for some pages"
        )
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
