"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { IGLPeriodClose } from "@/interfaces/gl-period-close"
import { toast } from "sonner"

import {
  useCloseGLPeriodModule,
  useGenerateGLPeriods,
  useGetGLPeriodCloseByCompanyYear,
  // useGetGLPeriodCloseSummary,
} from "@/hooks/use-gl-period-close"

import { PeriodCloseTable } from "./components/period-close-table"

export default function GLPeriodClosePage() {
  const params = useParams()
  const companyId = params.companyId as string
  const currentYear = new Date().getFullYear()

  // State
  const [selectedYear] = useState(currentYear)

  // Fetch data using hooks
  const {
    data: periodsResponse,
    isLoading: periodsLoading,
    error: periodsError,
  } = useGetGLPeriodCloseByCompanyYear(companyId, selectedYear)

  // const { data: summaryResponse } = useGetGLPeriodCloseSummary(companyId)

  // Mutations
  const { closeModule, reopenModule, isClosing } = useCloseGLPeriodModule()
  const generatePeriodsMutation = useGenerateGLPeriods()

  // Extract data from responses
  const periods = periodsResponse?.data || []
  // const summary = summaryResponse?.data

  // Handle module close
  const handleCloseModule = async (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    includeVat: boolean = false
  ) => {
    try {
      await closeModule(periodId, module, "admin", includeVat)
      toast.success(`${module} module closed successfully`)
    } catch (error) {
      toast.error(`Failed to close ${module} module`)
      console.error("Module close error:", error)
    }
  }

  // Handle module reopen
  const handleReopenModule = async (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL"
  ) => {
    try {
      await reopenModule(periodId, module, "admin")
      toast.success(`${module} module reopened successfully`)
    } catch (error) {
      toast.error(`Failed to reopen ${module} module`)
      console.error("Module reopen error:", error)
    }
  }

  // Handle export to Excel
  const handleExportExcel = () => {
    // Implementation for Excel export
    toast.info("Excel export functionality will be implemented")
  }

  // Handle export to PDF
  const handleExportPDF = () => {
    // Implementation for PDF export
    toast.info("PDF export functionality will be implemented")
  }

  // Handle generate periods for year
  const handleGeneratePeriods = async (year: number) => {
    try {
      await generatePeriodsMutation.mutateAsync({ companyId, year })
      toast.success(`Periods generated successfully for ${year}`)
    } catch (error) {
      toast.error("Failed to generate periods")
      console.error("Generate periods error:", error)
    }
  }

  // Generate sample data for demonstration
  const generateSampleData = (): IGLPeriodClose[] => {
    const sampleData: IGLPeriodClose[] = []

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(selectedYear, month - 1, 1)
      const endDate = new Date(selectedYear, month, 0)

      const period: IGLPeriodClose = {
        id: `${selectedYear}-${month}`,
        companyId,
        year: selectedYear,
        month,
        startDate: startDate.toISOString().split("T")[0],
        closeDate: endDate.toISOString().split("T")[0],

        // AR (Accounts Receivable)
        arClosed: month <= 3, // First 3 months closed
        arVatClosed: month <= 3,
        arCloseBy: month <= 3 ? "admin" : undefined,
        arCloseDate: month <= 3 ? "2025-06-24" : undefined,

        // AP (Accounts Payable)
        apClosed: month <= 3,
        apVatClosed: month <= 3,
        apCloseBy: month <= 3 ? "admin" : undefined,
        apCloseDate: month <= 3 ? "2025-04-30" : undefined,

        // CB (Cash Book)
        cbClosed: month <= 3,
        cbCloseBy: month <= 3 ? "admin" : undefined,
        cbCloseDate: month <= 3 ? "2025-04-28" : undefined,

        // GL (General Ledger)
        glClosed: month <= 3,
        glCloseBy: month <= 3 ? "admin" : undefined,
        glCloseDate: month <= 3 ? "2025-04-30" : undefined,

        // Metadata
        isActive: true,
        createDate: new Date().toISOString(),
        createBy: "admin",
      }

      sampleData.push(period)
    }

    return sampleData
  }

  // Use sample data if no real data is available
  const displayPeriods = (
    periods.length > 0 ? periods : generateSampleData()
  ) as IGLPeriodClose[]

  // Show loading state
  if (periodsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading period close data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (periodsError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">
            Failed to load period close data
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Period Close Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage financial period closing status for AR, AP, CB, and GL
            modules
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
          <button
            onClick={() => handleGeneratePeriods(selectedYear)}
            disabled={generatePeriodsMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 disabled:opacity-50 sm:w-auto"
          >
            {generatePeriodsMutation.isPending
              ? "Generating..."
              : "Generate Periods"}
          </button>
        </div>
      </div>

      {/* Summary Cards - Temporarily disabled due to type issues */}
      {/* {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {summary.totalPeriods || 12}
              </div>
              <div className="text-muted-foreground text-sm">Total Periods</div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">
                {summary.closedPeriods || 3}
              </div>
              <div className="text-muted-foreground text-sm">
                Closed Periods
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-orange-600">
                {summary.openPeriods || 9}
              </div>
              <div className="text-muted-foreground text-sm">Open Periods</div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">
                {summary.currentYear || currentYear}
              </div>
              <div className="text-muted-foreground text-sm">Current Year</div>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Period Close Table */}
      <PeriodCloseTable
        periods={displayPeriods as IGLPeriodClose[]}
        onCloseModule={handleCloseModule}
        onReopenModule={handleReopenModule}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        showActions={true}
      />

      {/* Loading Overlay */}
      {isClosing && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Processing module action...</p>
          </div>
        </div>
      )}
    </div>
  )
}
