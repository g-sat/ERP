"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

export default function CompanyDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const { currentCompany, companies } = useAuthStore()
  const companyId = params.companyId as string

  useEffect(() => {
    // Check if the company exists in the available companies
    const companyExists = companies.some((c) => c.companyId === companyId)

    if (!companyExists) {
      console.error(
        `Company with ID ${companyId} not found in available companies:`,
        companies
      )
      router.push("/company-select")
      return
    }

    // Verify that the company ID in the URL matches the current company
    if (currentCompany?.companyId !== companyId) {
      console.error("Company ID mismatch")
      router.push("/company-select")
      return
    }
  }, [companyId, currentCompany, companies, router])

  // If company doesn't exist or doesn't match, show loading state
  if (!currentCompany || currentCompany.companyId !== companyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Loading...</h1>
          <p>Please wait while we verify your company access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <div className="bg-card rounded-lg p-4 shadow">
        <h2 className="mb-2 text-xl">Company Information</h2>
        <p>Company ID: {companyId}</p>
        {currentCompany && <p>Company Name: {currentCompany.companyName}</p>}
      </div>
    </div>
  )
}
