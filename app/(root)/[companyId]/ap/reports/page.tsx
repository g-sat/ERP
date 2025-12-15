"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"
import { addMonths, format } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CompanySupplierAutocomplete,
  CurrencyAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import ReportView from "@/components/reports/reportview"

interface IReportFormData extends Record<string, unknown> {
  supplierId: string
  fromDate: string
  toDate: string
  asOfDate: string
  currencyId: string
  useTrsDate: boolean
  reportType: number
}

interface IReportParameters {
  companyId: number
  fromDate: string | null
  toDate: string | null
  asOfDate: string | null
  supplierId: number | null
  currencyId: number
  reportType: number
}

interface IReport {
  id: string
  name: string
  category: string
  reportFile: string
}

const REPORT_CATEGORIES = [
  {
    name: "Aging",
    reports: [
      {
        id: "ap-aging",
        name: "AP Aging",
        reportFile: "ArAging.trdp",
      },
      {
        id: "ap-aging-details",
        name: "AP Aging Details",
        reportFile: "ap/APAgingDetails.trdp",
      },
      {
        id: "ap-aging-summary",
        name: "AP Aging Summary",
        reportFile: "ap/APAgingSummary.trdp",
      },
    ],
  },
  {
    name: "AP",
    reports: [
      {
        id: "ap-outstanding-details",
        name: "AP Outstanding Details",
        reportFile: "ap/APOutstandingDetails.trdp",
      },
      {
        id: "ap-outstanding-summary",
        name: "AP Outstanding Summary",
        reportFile: "ap/APOutstandingSummary.trdp",
      },
      {
        id: "ap-balances",
        name: "AP Balances",
        reportFile: "ap/APBalances.trdp",
      },
      {
        id: "ap-subsequent-receipt",
        name: "AP Subsequent Receipt",
        reportFile: "ap/APSubsequentReceipt.trdp",
      },
      {
        id: "statement-of-account",
        name: "Statement Of Account",
        reportFile: "ap/StatementOfAccount.trdp",
      },
      {
        id: "monthly-receivable",
        name: "Monthly Receivable",
        reportFile: "ap/MonthlyReceivable.trdp",
      },

      {
        id: "supplier-invoice-receipt",
        name: "Supplier Invoice/Receipt",
        reportFile: "ap/SupplierInvoiceReceipt.trdp",
      },
    ],
  },
  {
    name: "Other",
    reports: [
      {
        id: "sales-transaction",
        name: "Sales Transaction",
        reportFile: "ap/SalesTransaction.trdp",
      },
      {
        id: "invoice-register",
        name: "Invoice Register",
        reportFile: "ap/InvoiceRegister.trdp",
      },
      {
        id: "pending-for-invoicing",
        name: "Pending For Invoicing",
        reportFile: "ap/PendingForInvoicing.trdp",
      },
      {
        id: "launch-invoice",
        name: "Launch Invoice",
        reportFile: "ap/LaunchInvoice.trdp",
      },
      {
        id: "gross-sales",
        name: "Gross Sales",
        reportFile: "ap/GrossSales.trdp",
      },
    ],
  },
]

export default function ReportsPage() {
  const params = useParams()
  const companyId = Number(params.companyId)
  const { decimals } = useAuthStore()
  // Use the same date format logic as CustomDateNew
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [showReportViewer, setShowReportViewer] = useState(false)
  const [currentReport, setCurrentReport] = useState<{
    reportFile: string
    parameters: Record<string, unknown>
  } | null>(null)
  const viewerRef = useRef<TelerikReportViewer>(null)

  // Get current date formatted
  const getCurrentDate = () => {
    return format(new Date(), dateFormat)
  }

  const form = useForm<IReportFormData>({
    defaultValues: {
      supplierId: "",
      fromDate: "",
      toDate: "",
      asOfDate: "",
      currencyId: "0",
      useTrsDate: true,
      reportType: 0,
    },
  })

  // Handle fromDate change and automatically set toDate to 2 months later
  const handleFromDateChange = (date: Date | null) => {
    if (date) {
      const twoMonthsLater = addMonths(date, 2)
      const formattedToDate = format(twoMonthsLater, dateFormat)
      form.setValue("toDate", formattedToDate)
    }
  }

  // Initialize asOfDate to current date on mount
  useEffect(() => {
    const currentDate = format(new Date(), dateFormat)
    form.setValue("asOfDate", currentDate)
  }, [form, dateFormat])

  const handleReportToggle = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? [] : [reportId]))
  }

  const getAllReports = (): IReport[] => {
    return REPORT_CATEGORIES.flatMap((category) =>
      category.reports.map((report) => ({
        ...report,
        category: category.name,
      }))
    )
  }

  const getSelectedReportObjects = (): IReport[] => {
    const allReports = getAllReports()
    return allReports.filter((report) => selectedReports.includes(report.id))
  }

  const buildReportParameters = (data: IReportFormData): IReportParameters => {
    return {
      companyId,
      fromDate: data.fromDate || null,
      toDate: data.toDate || null,
      asOfDate: data.asOfDate || getCurrentDate(),
      supplierId: data.supplierId ? Number(data.supplierId) : null,
      currencyId: data.currencyId ? Number(data.currencyId) : 0,
      reportType: 0, // Always 0
    }
  }

  const handleViewReport = (data: IReportFormData) => {
    const selectedReportObjects = getSelectedReportObjects()
    if (selectedReportObjects.length === 0) {
      return
    }

    const parameters = buildReportParameters(data)
    const report = selectedReportObjects[0] // Only one report can be selected

    const reportParams = {
      companyId: parameters.companyId,
      fromDate: parameters.fromDate,
      toDate: parameters.toDate,
      asOfDate: parameters.asOfDate || getCurrentDate(),
      supplierId: parameters.supplierId,
      currencyId: parameters.currencyId,
      reportType: 0,
    }

    setCurrentReport({
      reportFile: report.reportFile,
      parameters: reportParams,
    })
    setShowReportViewer(true)
  }

  const handleRefresh = (): void => {
    if (viewerRef.current) {
      viewerRef.current.refreshReport()
    }
  }

  const handlePrint = (): void => {
    if (viewerRef.current?.commands?.print) {
      viewerRef.current.commands.print.exec()
    }
  }

  const handleBackToForm = (): void => {
    // Cleanup viewer before going back
    if (viewerRef.current && typeof viewerRef.current.dispose === "function") {
      try {
        viewerRef.current.dispose()
      } catch (error) {
        console.error("Error disposing viewer:", error)
      }
    }
    setShowReportViewer(false)
    setCurrentReport(null)
  }

  const handleClear = () => {
    const currentDate = format(new Date(), dateFormat)
    form.reset({
      supplierId: "",
      fromDate: "",
      toDate: "",
      asOfDate: currentDate,
      currencyId: "0",
      useTrsDate: true,
      reportType: 0,
    })
    setSelectedReports([])
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            AP Reports
          </h1>
          <p className="text-muted-foreground text-xs">
            Select reports and configure parameters to generate AP reports
          </p>
        </div>
      </div>

      <Separator />

      {showReportViewer && currentReport ? (
        /* Report Viewer */
        <div className="relative flex h-[calc(100vh-200px)] w-full flex-col">
          <div className="bg-background z-10 flex items-center justify-between gap-2 border-b p-2">
            <div className="flex items-center gap-2">
              <Button onClick={handleRefresh} size="sm">
                Refresh
              </Button>
              <Button onClick={handlePrint} size="sm">
                Print
              </Button>
            </div>
            <Button onClick={handleBackToForm} variant="outline" size="sm">
              Back to Criteria
            </Button>
          </div>
          <div className="relative w-full flex-1 overflow-hidden">
            <ReportView
              viewerRef={viewerRef}
              reportSource={{
                report: currentReport.reportFile,
                parameters: currentReport.parameters,
              }}
            />
          </div>
        </div>
      ) : (
        /* Report Selection and Parameters Form */
        <div className="grid gap-4 md:grid-cols-2">
          {/* Report Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Select Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-6 pr-4">
                  {REPORT_CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-3">
                      <h3 className="text-foreground text-sm font-medium">
                        {category.name}
                      </h3>
                      <div className="space-y-2">
                        {category.reports.map((report) => (
                          <div
                            key={report.id}
                            className="hover:bg-muted flex cursor-pointer items-center space-x-2 rounded-md p-2 transition-colors"
                          >
                            <Checkbox
                              checked={selectedReports.includes(report.id)}
                              onCheckedChange={() => {
                                handleReportToggle(report.id)
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            />
                            <label
                              className="flex-1 cursor-pointer text-sm font-normal"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleReportToggle(report.id)
                              }}
                            >
                              {report.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Report Parameters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Report Parameters
                {selectedReports.length > 0 && (
                  <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">
                    {getSelectedReportObjects()[0]?.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleViewReport)}
                  className="space-y-4"
                >
                  {/* Supplier */}
                  <CompanySupplierAutocomplete
                    form={form}
                    name="supplierId"
                    label="Supplier"
                    companyId={companyId}
                    isRequired={false}
                  />

                  {/* Transaction Date Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useTrsDate"
                      checked={form.watch("useTrsDate")}
                      onCheckedChange={(checked) =>
                        form.setValue("useTrsDate", checked as boolean)
                      }
                    />
                    <label
                      htmlFor="useTrsDate"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Trs Date
                    </label>
                  </div>

                  {/* Date Range - Only show if checkbox is checked */}
                  {form.watch("useTrsDate") && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <CustomDateNew
                        form={form}
                        name="fromDate"
                        label="From Date"
                        isRequired={false}
                        onChangeEvent={handleFromDateChange}
                      />
                      <CustomDateNew
                        form={form}
                        name="toDate"
                        label="To Date"
                        isRequired={false}
                      />
                      <CustomDateNew
                        form={form}
                        name="asOfDate"
                        label="As Of Date"
                        isRequired={false}
                      />
                    </div>
                  )}

                  {/* Currency */}
                  <CurrencyAutocomplete
                    form={form}
                    name="currencyId"
                    label="Currency"
                    isRequired={true}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={selectedReports.length === 0}
                      className="flex-1"
                    >
                      View Report
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
