"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const { switchCompany } = useAuthStore()
  const companyId = params.companyId as string

  React.useEffect(() => {
    if (companyId) {
      switchCompany(companyId)
    }
  }, [companyId, switchCompany])

  return <>{children}</>
}
