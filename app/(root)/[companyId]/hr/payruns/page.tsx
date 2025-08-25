"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { IPayrollDashboard } from "@/interfaces/payrun"

import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ProcessPayRunCard } from "./components/pay-run-card"
import { PayRunHistoryTable } from "./components/pay-run-history-table"

export default function PayRunsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const companyId = params.companyId as string
  const [activeTab, setActiveTab] = useState("run-payroll")

  const { data: payRunData, refetch } = useGet<IPayrollDashboard>(
    `/hr/payrollruns/dashboard`,
    "pay-run"
  )
  const payRun = payRunData?.data as unknown as IPayrollDashboard
  console.log("payRun", payRun)

  // Check if refetch is requested via URL parameter
  useEffect(() => {
    const shouldRefetch = searchParams.get("refetch")
    if (shouldRefetch === "true") {
      refetch()
      // Remove the refetch parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("refetch")
      router.replace(newUrl.pathname + newUrl.search)
    }
  }, [searchParams, refetch, router])

  const handleProcess = async (payrollRunId?: number) => {
    if (payrollRunId) {
      router.push(`/${companyId}/hr/payruns/${payrollRunId}/preview`)
    }
  }

  const handleApprove = (payrollRunId?: number) => {
    if (payrollRunId) {
      router.push(`/${companyId}/hr/payruns/${payrollRunId}/summary`)
    }
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Pay Runs
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage payroll processing and payment history
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 gap-2">
          <TabsTrigger value="run-payroll" className="text-xs sm:text-sm">
            Run Payroll
          </TabsTrigger>
          <TabsTrigger value="payroll-history" className="text-xs sm:text-sm">
            Payroll History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run-payroll" className="space-y-4">
          {payRun && !payRun.isPaid && (
            <ProcessPayRunCard
              payRun={payRun}
              onProcess={handleProcess}
              onDraft={handleProcess}
              onApprove={handleApprove}
            />
          )}
          {payRun && payRun.isPaid && (
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground text-sm">
                Payroll has already been processed and paid.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payroll-history" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Payroll Type:</span>
              <Badge variant="outline">All</Badge>
            </div>
          </div>
          <PayRunHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
