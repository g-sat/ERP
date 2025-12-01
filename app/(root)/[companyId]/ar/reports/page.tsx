"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { addMonths, format } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CompanyCustomerAutocomplete,
  CurrencyAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"

interface IReportFormData extends Record<string, unknown> {
  customerId: string
  currencyId: string
  fromDate: string
  toDate: string
  asOfDate: string
  useTrsDate: boolean
  useAsDate: boolean
  reportType: number
}

interface IReportParameters {
  companyId: number
  companyName: string | null
  fromDate: string | null
  toDate: string | null
  asOfDate: string | null
  customerId: number | null
  currencyId: number
  reportType: number
  amtDec: number
  locAmtDec: number
}

interface IReport {
  id: string
  name: string
  category: string
  reportFile: string
}

// Reports that use TrsDate (From/To Date)
const TRS_DATE_REPORTS = [
  "customer-ledger",
  "sales-transaction",
  "pending-for-invoicing",
  "launch-invoice",
  "gross-sales",
]

const REPORT_CATEGORIES = [
  {
    name: "Aging",
    reports: [
      {
        id: "ar-aging-details",
        name: "AR Aging Details",
        reportFile: "ArAgingDetails.trdp",
      },
      {
        id: "ar-aging-summary",
        name: "AR Aging Summary",
        reportFile: "ArAgingSummary.trdp",
      },
    ],
  },
  {
    name: "AR",
    reports: [
      {
        id: "ar-outstanding-details",
        name: "AR Outstanding Details",
        reportFile: "ArOutstandingDetails.trdp",
      },
      {
        id: "ar-outstanding-summary",
        name: "AR Outstanding Summary",
        reportFile: "ArOutstandingSummary.trdp",
      },
      { id: "ar-balances", name: "AR Balances", reportFile: "ArBalances.trdp" },
      {
        id: "ar-subsequent-receipt",
        name: "AR Subsequent Receipt",
        reportFile: "ArSubsequentReceipt.trdp",
      },
      {
        id: "statement-of-account",
        name: "Statement Of Account",
        reportFile: "ArStatementOfAccount.trdp",
      },
      {
        id: "monthly-receivable",
        name: "Monthly Receivable",
        reportFile: "ArMonthlyReceivable.trdp",
      },
      {
        id: "customer-ledger",
        name: "Customer Ledger",
        reportFile: "ArCustomerLedger.trdp",
      },
      {
        id: "customer-invoice-receipt",
        name: "Customer Invoice/Receipt",
        reportFile: "ArCustomerInvoiceReceipt.trdp",
      },
    ],
  },
  {
    name: "Other",
    reports: [
      {
        id: "sales-transaction",
        name: "Sales Transaction",
        reportFile: "ArSalesTransaction.trdp",
      },
      {
        id: "invoice-register",
        name: "Invoice Register",
        reportFile: "ArInvoiceRegister.trdp",
      },
      {
        id: "pending-for-invoicing",
        name: "Pending For Invoicing",
        reportFile: "ArPendingForInvoicing.trdp",
      },
      {
        id: "launch-invoice",
        name: "Launch Invoice",
        reportFile: "ArLaunchInvoice.trdp",
      },
      {
        id: "gross-sales",
        name: "Gross Sales",
        reportFile: "ArGrossSales.trdp",
      },
    ],
  },
]

export default function ReportsPage() {
  const params = useParams()
  const companyId = Number(params.companyId)
  const { decimals, companies, user } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const companyName: string | null =
    companies.find((company) => company.companyId === companyId.toString())
      ?.companyName || null
  // Use the same date format logic as CustomDateNew
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  // Get current date formatted
  const getCurrentDate = () => {
    return format(new Date(), dateFormat)
  }

  const form = useForm<IReportFormData>({
    defaultValues: {
      customerId: "",
      currencyId: "0",
      fromDate: "",
      toDate: "",
      asOfDate: "",
      useTrsDate: true,
      useAsDate: false,
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

  // Update date selection based on selected report
  useEffect(() => {
    if (selectedReports.length > 0) {
      const selectedReportId = selectedReports[0]
      const usesTrsDate = TRS_DATE_REPORTS.includes(selectedReportId)

      if (usesTrsDate) {
        // Set TrsDate to true and disable AsDate
        form.setValue("useTrsDate", true)
        form.setValue("useAsDate", false)
      } else {
        // Set AsDate to true and disable TrsDate
        form.setValue("useTrsDate", false)
        form.setValue("useAsDate", true)
      }
    }
  }, [selectedReports, form])

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
      companyName: companyName || "",
      customerId: data.customerId ? Number(data.customerId) : null,
      currencyId: data.currencyId ? Number(data.currencyId) : 0,
      fromDate: data.fromDate || null,
      toDate: data.toDate || null,
      asOfDate: data.asOfDate || getCurrentDate(),
      reportType: data.reportType || 0, // Always 0
      amtDec: amtDec,
      locAmtDec: locAmtDec,
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
      companyName: parameters.companyName,
      fromDate: parameters.fromDate,
      toDate: parameters.toDate,
      asOfDate: parameters.asOfDate || getCurrentDate(),
      customerId: parameters.customerId,
      currencyId: parameters.currencyId,
      reportType: parameters.reportType,
      amtDec: parameters.amtDec,
      locAmtDec: parameters.locAmtDec,
      userName: user?.userName || "",
    }

    console.log(reportParams)

    // Store report data in sessionStorage with a fixed key to avoid URL parameters
    const reportData = {
      reportFile: report.reportFile,
      parameters: reportParams,
    }

    try {
      // Use a fixed key - will be overwritten each time a new report is opened
      sessionStorage.setItem(`report_${companyId}`, JSON.stringify(reportData))
    } catch (error) {
      console.error("Error storing report data:", error)
      // Fallback to URL parameters if sessionStorage fails
      window.open(
        `/${companyId}/reports/viewer?report=${encodeURIComponent(
          report.reportFile
        )}&params=${encodeURIComponent(JSON.stringify(reportParams))}`,
        "_blank"
      )
      return
    }

    // Clean URL without any query parameters
    window.open(`/${companyId}/reports/viewer`, "_blank")
  }

  const handleClear = () => {
    const currentDate = format(new Date(), dateFormat)
    form.reset({
      customerId: "",
      fromDate: "",
      toDate: "",
      asOfDate: currentDate,
      currencyId: "0",
      useTrsDate: true,
      useAsDate: false,
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
            AR Reports
          </h1>
          <p className="text-muted-foreground text-xs">
            Select reports and configure parameters to generate AR reports
          </p>
        </div>
      </div>

      <Separator />

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
                {/* Customer */}
                <CompanyCustomerAutocomplete
                  form={form}
                  name="customerId"
                  label="Customer"
                  companyId={companyId}
                  isRequired={false}
                />

                {/* Currency */}
                <CurrencyAutocomplete
                  form={form}
                  name="currencyId"
                  label="Currency"
                  isRequired={true}
                />

                {/* Date Range - Show From/To Date for TrsDate reports */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CustomDateNew
                    form={form}
                    name="fromDate"
                    label="From Date:"
                    isRequired={false}
                    isDisabled={form.watch("useAsDate")}
                    onChangeEvent={handleFromDateChange}
                  />
                  <CustomDateNew
                    form={form}
                    name="toDate"
                    label="To Date:"
                    isRequired={false}
                    isDisabled={form.watch("useAsDate")}
                  />
                </div>

                {/* As Date - Show only for non-TrsDate reports */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CustomDateNew
                    form={form}
                    name="asOfDate"
                    label="As Date:"
                    isRequired={false}
                    isDisabled={form.watch("useTrsDate")}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={selectedReports.length === 0}
                    className="flex-1"
                  >
                    View Report
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
