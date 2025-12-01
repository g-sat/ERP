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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ChartOfAccountAutocomplete,
  CurrencyAutocomplete,
  DepartmentAutocomplete,
  GSTAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"

interface IReportFormData extends Record<string, unknown> {
  fromGlId: string
  toGlId: string
  sameToGl: boolean
  departmentId: string
  fromDate: string
  toDate: string
  asOfDate: string
  currencyId: string
  useTrsDate: boolean
  useAsDate: boolean
  reportType: string
  vatType: string
  vatId: string
}

interface IReportParameters {
  companyId: number
  fromGlId: number | null
  toGlId: number | null
  departmentId: number | null
  fromDate: string | null
  toDate: string | null
  asOfDate: string | null
  currencyId: number
  reportType: string
  vatType: string
  vatId: number | null
}

interface IReport {
  id: string
  name: string
  category: string
  reportFile: string
}

const REPORT_CATEGORIES = [
  {
    name: "Financial Report",
    reports: [
      {
        id: "trial-balance-summary",
        name: "Trial Balance Summary Report (OB/CB)",
        reportFile: "TrialBalanceSummary.trdp",
      },
      {
        id: "trial-balance-debit-credit",
        name: "Trial Balance (DEBIT/CREDIT)",
        reportFile: "TrialBalanceDebitCredit.trdp",
      },
      {
        id: "trial-balance",
        name: "Trial Balance",
        reportFile: "TrialBalance.trdp",
      },
      {
        id: "balance-sheet-details",
        name: "Balance Sheet Details",
        reportFile: "BalanceSheetDetails.trdp",
      },
      {
        id: "profit-loss-details",
        name: "Profit & Loss Account Details",
        reportFile: "ProfitLossDetails.trdp",
      },
      {
        id: "balance-sheet-summary",
        name: "Balance Sheet Summary",
        reportFile: "BalanceSheetSummary.trdp",
      },
      {
        id: "profit-loss-summary",
        name: "Profit & Loss Account Summary",
        reportFile: "ProfitLossSummary.trdp",
      },
    ],
  },
  {
    name: "VAT & Activities",
    reports: [
      {
        id: "gl-ledger",
        name: "GLLedger",
        reportFile: "GLLedger.trdp",
      },
      {
        id: "gl-ledger-details",
        name: "GLLedger (Details)",
        reportFile: "GLLedgerDetails.trdp",
      },
      {
        id: "gl-activity-details",
        name: "GL Activity Details",
        reportFile: "GLActivityDetails.trdp",
      },
      {
        id: "combined-vat-computation",
        name: "Combined VAT Computation",
        reportFile: "CombinedVATComputation.trdp",
      },
      {
        id: "report-for-vat-authority",
        name: "Report for VAT Authority",
        reportFile: "ReportForVATAuthority.trdp",
      },
      {
        id: "vat-details",
        name: "VAT Details",
        reportFile: "VATDetails.trdp",
      },
      {
        id: "vat-summary",
        name: "VAT Summary",
        reportFile: "VATSummary.trdp",
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

  // Get current date formatted
  const getCurrentDate = () => {
    return format(new Date(), dateFormat)
  }

  const form = useForm<IReportFormData>({
    defaultValues: {
      fromGlId: "",
      toGlId: "",
      sameToGl: false,
      departmentId: "",
      fromDate: "",
      toDate: "",
      asOfDate: "",
      currencyId: "0",
      useTrsDate: true,
      useAsDate: false,
      reportType: "",
      vatType: "",
      vatId: "",
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

  // Handle fromGlId change and set toGlId if sameToGl is checked
  const handleFromGlChange = (gl: { glId: number } | null) => {
    if (form.watch("sameToGl") && gl) {
      form.setValue("toGlId", gl.glId.toString())
    }
  }

  // Handle sameToGl checkbox change
  const handleSameToGlChange = (checked: boolean) => {
    form.setValue("sameToGl", checked)
    if (checked) {
      const fromGlId = form.watch("fromGlId")
      if (fromGlId) {
        form.setValue("toGlId", fromGlId)
      }
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
      fromGlId: data.fromGlId ? Number(data.fromGlId) : null,
      toGlId: data.toGlId ? Number(data.toGlId) : null,
      departmentId: data.departmentId ? Number(data.departmentId) : null,
      fromDate: data.fromDate || null,
      toDate: data.toDate || null,
      asOfDate: data.asOfDate || getCurrentDate(),
      currencyId: data.currencyId ? Number(data.currencyId) : 0,
      reportType: data.reportType || "",
      vatType: data.vatType || "",
      vatId: data.vatId ? Number(data.vatId) : null,
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
      fromGlId: parameters.fromGlId,
      toGlId: parameters.toGlId,
      departmentId: parameters.departmentId,
      fromDate: parameters.fromDate,
      toDate: parameters.toDate,
      asOfDate: parameters.asOfDate || getCurrentDate(),
      currencyId: parameters.currencyId,
      reportType: parameters.reportType,
      vatType: parameters.vatType,
      vatId: parameters.vatId,
    }

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
      fromGlId: "",
      toGlId: "",
      sameToGl: false,
      departmentId: "",
      fromDate: "",
      toDate: "",
      asOfDate: currentDate,
      currencyId: "0",
      useTrsDate: true,
      useAsDate: false,
      reportType: "",
      vatType: "",
      vatId: "",
    })
    setSelectedReports([])
  }

  return (
    <div className="@container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            GL Reports
          </h1>
          <p className="text-muted-foreground text-xs">
            Select reports and configure parameters to generate GL reports
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
                {/* Instruction Note for VAT Section */}
                <div className="bg-destructive/10 text-destructive rounded-md p-2 text-xs">
                  Note: For the VAT Section report, select the income code in
                  the dropdown From-To GL-Name
                </div>

                {/* GL Name Selection */}
                <div className="flex flex-row items-end gap-4">
                  <div className="flex-1">
                    <ChartOfAccountAutocomplete
                      form={form}
                      name="fromGlId"
                      label="From GL Name"
                      companyId={companyId}
                      isRequired={false}
                      onChangeEvent={handleFromGlChange}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pb-2">
                    <Checkbox
                      id="sameToGl"
                      checked={form.watch("sameToGl")}
                      onCheckedChange={(checked) =>
                        handleSameToGlChange(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="sameToGl"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Same To GL:
                    </label>
                  </div>

                  <div className="flex-1">
                    <ChartOfAccountAutocomplete
                      form={form}
                      name="toGlId"
                      label="To GL Name"
                      companyId={companyId}
                      isRequired={false}
                      isDisabled={form.watch("sameToGl")}
                    />
                  </div>
                </div>

                {/* Department */}
                <DepartmentAutocomplete
                  form={form}
                  name="departmentId"
                  label="Department:"
                  isRequired={false}
                />

                {/* Date Selection Checkboxes */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useTrsDate"
                      checked={form.watch("useTrsDate")}
                      onCheckedChange={(checked) => {
                        const isChecked = checked as boolean
                        form.setValue("useTrsDate", isChecked)
                        if (isChecked) {
                          form.setValue("useAsDate", false)
                        }
                      }}
                    />
                    <label
                      htmlFor="useTrsDate"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Trs Date:
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useAsDate"
                      checked={form.watch("useAsDate")}
                      onCheckedChange={(checked) => {
                        const isChecked = checked as boolean
                        form.setValue("useAsDate", isChecked)
                        if (isChecked) {
                          form.setValue("useTrsDate", false)
                        }
                      }}
                    />
                    <label
                      htmlFor="useAsDate"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      As Date:
                    </label>
                  </div>
                </div>

                {/* Date Range - Show From/To Date only when Trs Date is selected */}
                {form.watch("useTrsDate") && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomDateNew
                      form={form}
                      name="fromDate"
                      label="From Date:"
                      isRequired={false}
                      onChangeEvent={handleFromDateChange}
                    />
                    <CustomDateNew
                      form={form}
                      name="toDate"
                      label="To Date:"
                      isRequired={false}
                    />
                  </div>
                )}

                {/* As Date - Show only when As Date is selected */}
                {form.watch("useAsDate") && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomDateNew
                      form={form}
                      name="asOfDate"
                      label="As Date:"
                      isRequired={false}
                    />
                  </div>
                )}

                {/* Currency */}
                <CurrencyAutocomplete
                  form={form}
                  name="currencyId"
                  label="* Currency:"
                  isRequired={true}
                />

                {/* Report Type, VAT Type, and VAT in one row */}
                <div className="flex flex-row gap-4">
                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-sm font-medium">Report Type:</label>
                    <Select
                      value={form.watch("reportType")}
                      onValueChange={(value) =>
                        form.setValue("reportType", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select.." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="details">Details</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <label className="text-sm font-medium">VAT Type:</label>
                    <Select
                      value={form.watch("vatType")}
                      onValueChange={(value) => form.setValue("vatType", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select.." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="input">Input</SelectItem>
                        <SelectItem value="output">Output</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <GSTAutocomplete
                      form={form}
                      name="vatId"
                      label="VAT:"
                      isRequired={false}
                    />
                  </div>
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
