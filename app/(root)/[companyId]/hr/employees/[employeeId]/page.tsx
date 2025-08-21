"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()

  const employeeId = params.employeeId as string
  const companyId = params.companyId as string

  // Redirect to overview tab by default
  useEffect(() => {
    router.replace(`/${companyId}/hr/employees/${employeeId}/overview-details`)
  }, [router, companyId, employeeId])

  // Show loading while redirecting
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-lg">Loading employee details...</div>
    </div>
  )
}
