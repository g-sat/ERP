"use client"

import * as React from "react"
import { format } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  CompanyCustomerAutocomplete,
  CurrencyAutocomplete,
} from "@/components/autocomplete"
import { CustomDateNew } from "@/components/custom/custom-date-new"

interface ReportFormData extends Record<string, unknown> {
  report: string
  customer: string
  fromDate: string
  toDate: string
  asDate: string
  currency: string
}

interface ReportFormProps {
  onSearchAction: (data: ReportFormData) => void
  onClearAction: () => void
}

export default function ReportForm({
  onSearchAction,
  onClearAction,
}: ReportFormProps) {
  const form = useForm<ReportFormData>({
    defaultValues: {
      report: "",
      customer: "",
      fromDate: format(new Date(), "yyyy-MM-dd"),
      toDate: format(new Date(), "yyyy-MM-dd"),
      asDate: format(new Date(), "yyyy-MM-dd"),
      currency: "",
    },
  })

  const handleSubmit = (data: ReportFormData) => {
    onSearchAction(data)
  }

  const handleClear = () => {
    form.reset({
      report: "",
      customer: "",
      fromDate: format(new Date(), "yyyy-MM-dd"),
      toDate: format(new Date(), "yyyy-MM-dd"),
      asDate: format(new Date(), "yyyy-MM-dd"),
      currency: "",
    })
    onClearAction()
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
        <div className="grid grid-cols-7 items-end gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report</label>
            <select
              {...form.register("report")}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Report</option>
              <option value="outstanding">Outstanding Transactions</option>
              <option value="ledger">Customer Ledger</option>
              <option value="aging">Aging Analysis</option>
              <option value="collection">Collection Report</option>
              <option value="credit">Credit Limit Report</option>
              <option value="sales">Sales Analysis</option>
              <option value="payment">Payment History</option>
              <option value="invoice">Invoice Summary</option>
              <option value="receipt">Receipt Report</option>
              <option value="adjustment">Adjustment Report</option>
              <option value="refund">Refund Report</option>
              <option value="credit-note">Credit Note Report</option>
              <option value="debit-note">Debit Note Report</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <CompanyCustomerAutocomplete
              form={form}
              name="customer"
              onChangeEvent={(customer) => {
                form.setValue("customer", customer?.customerName || "")
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <CustomDateNew form={form} name="fromDate" className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <CustomDateNew form={form} name="toDate" className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">As Date</label>
            <CustomDateNew form={form} name="asDate" className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <CurrencyAutocomplete
              form={form}
              name="currency"
              onChangeEvent={(currency) => {
                form.setValue("currency", currency?.currencyName || "")
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Actions</label>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit">Search</Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
