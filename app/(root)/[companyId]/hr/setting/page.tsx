"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function HRSettingRedirectPage() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get the base path (e.g., /1/hr/setting) and redirect to work-location
    const basePath = pathname.replace(/\/$/, "") // Remove trailing slash if any
    router.replace(`${basePath}/work-location`)
  }, [router, pathname])

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-muted-foreground">
            Redirecting to Work Location settings...
          </p>
        </div>
      </div>
    </div>
  )
}
