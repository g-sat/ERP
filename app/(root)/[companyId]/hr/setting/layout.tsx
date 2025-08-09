"use client"

import { usePathname, useRouter } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HRSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // Extract the current tab from the pathname
  const getCurrentTab = () => {
    if (pathname.includes("/work-location")) return "work-location"
    if (pathname.includes("/designation")) return "designation"
    if (pathname.includes("/department")) return "department"
    if (pathname.includes("/payroll-components")) return "payroll-components"
    if (pathname.includes("/payroll-periods")) return "payroll-periods"
    if (pathname.includes("/account-integration")) return "account-integration"
    if (pathname.includes("/employer-details")) return "employer-details"
    // If we're at the root /hr/setting path, return work-location as default
    if (pathname.endsWith("/hr/setting") || pathname.endsWith("/hr/setting/")) {
      return "work-location"
    }
    return "work-location" // default
  }

  const handleTabChange = (value: string) => {
    // Get the base path (e.g., /1/hr/setting) and navigate to the specific tab
    const basePath = pathname.split("/hr/setting")[0] + "/hr/setting"
    router.push(`${basePath}/${value}`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs
        value={getCurrentTab()}
        className="space-y-4"
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="work-location">Work Location</TabsTrigger>
          <TabsTrigger value="designation">Designation</TabsTrigger>
          <TabsTrigger value="department">Department</TabsTrigger>
          <TabsTrigger value="payroll-components">
            Payroll Components
          </TabsTrigger>
          <TabsTrigger value="payroll-periods">Payroll Periods</TabsTrigger>
          <TabsTrigger value="account-integration">
            Account Integration
          </TabsTrigger>
          <TabsTrigger value="employer-details">Employer Details</TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
