"use client"

import { useEffect } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { useGetEmployeeById } from "@/hooks/use-employee"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EmployeeDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const employeeId = params.employeeId as string
  const companyId = params.companyId as string

  // Fetch employee data with proper caching
  const { data: employeeData } = useGetEmployeeById(employeeId)
  const employee = employeeData?.data as unknown as {
    employeeName?: string
    employeeCode?: string
  }

  // Handle back button click
  const handleBack = () => {
    router.push(`/${companyId}/hr/employees`)
  }

  // Get current tab from pathname
  const getCurrentTab = () => {
    if (pathname.includes("/overview-details")) return "overview-details"
    if (pathname.includes("/salary-details")) return "salary-details"
    if (pathname.includes("/document-details")) return "document-details"
    return "overview-details"
  }

  const currentTab = getCurrentTab()

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === "overview-details") {
      router.push(`/${companyId}/hr/employees/${employeeId}/overview-details`)
    } else {
      router.push(`/${companyId}/hr/employees/${employeeId}/${value}`)
    }
  }

  // Redirect to overview if on the main employee page
  useEffect(() => {
    if (pathname === `/${companyId}/hr/employees/${employeeId}`) {
      router.push(`/${companyId}/hr/employees/${employeeId}/overview-details`)
    }
  }, [pathname, companyId, employeeId, router])

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold">
                <Badge variant="destructive" className="text-lg">
                  {employee?.employeeName || ""}
                </Badge>
              </h1>
              <Badge variant="secondary" className="text-xs">
                EMP. ID: {employee?.employeeCode || ""}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Below employee info */}
        <div className="mt-4">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger
                value="overview-details"
                className="text-sm font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="salary-details"
                className="text-sm font-medium"
              >
                Salary Details
              </TabsTrigger>
              <TabsTrigger
                value="document-details"
                className="text-sm font-medium"
              >
                Documents
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  )
}
