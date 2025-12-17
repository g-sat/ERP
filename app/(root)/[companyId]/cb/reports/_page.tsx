"use client"

import { useState } from "react"
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
  BankAutocomplete,
  CurrencyAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"

interface IReportFormData extends Record<string, unknown> {
  bankId: string
  fromDate: string
  toDate: string
  currencyId: string
  useTrsDate: boolean
  reportType: number
}

interface IReportParameters {
  companyId: number
  fromDate: string | null
  toDate: string | null
  bankId: number | null
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
    name: "Register",
    reports: [
      {
        id: "payment-register",
        name: "Payment Register",
        reportFile: "cb/PaymentRegister.trdp",
      },
      {
        id: "receipt-register",
        name: "Receipt Register",
        reportFile: "cb/ReceiptRegister.trdp",
      },
      {
        id: "bank-register",
        name: "Bank Register",
        reportFile: "cb/BankRegister.trdp",
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

  const form = useForm<IReportFormData>({
    defaultValues: {
      bankId: "",
      fromDate: "",
      toDate: "",
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
      bankId: data.bankId ? Number(data.bankId) : null,
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

    selectedReportObjects.forEach((report) => {
      const reportParams = {
        companyId: parameters.companyId,
        fromDate: parameters.fromDate,
        toDate: parameters.toDate,
        bankId: parameters.bankId,
        currencyId: parameters.currencyId,
        reportType: 0,
      }

      window.open(
        `/${companyId}/reports/viewer?report=${encodeURIComponent(
          report.reportFile
        )}&params=${encodeURIComponent(JSON.stringify(reportParams))}`,
        "_blank",
        "width=1200,height=800"
      )
    })
  }

  const handleClear = () => {
    form.reset({
      bankId: "",
      fromDate: "",
      toDate: "",
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
            CB Reports
          </h1>
          <p className="text-muted-foreground text-xs">
            Select reports and configure parameters to generate CB reports
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Report Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-6 pr-4">
                {REPORT_CATEGORIES.map((category) => (
                  <div key={category.name} className="space-y-3">
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
                            className="text-primary flex-1 cursor-pointer text-sm font-normal"
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
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Report Parameters Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              Report Criteria
              {selectedReports.length > 0 && (
                <span className="text-muted-foreground ml-2">
                  ({getSelectedReportObjects()[0]?.name})
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
                {/* Bank */}
                <BankAutocomplete
                  form={form}
                  name="bankId"
                  label="Bank"
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
