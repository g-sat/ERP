"use client"

import { useState } from "react"
import { DownloadIcon, FilterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { ARAgingSummary } from "./components/ar-aging-summary"
import { CollectionEffectivenessIndex } from "./components/collection-effectiveness-index"
import { CreditLimitAlerts } from "./components/credit-limit-alerts"
import { DSOTrendAnalysis } from "./components/dso-trend-analysis"
import { GlobalFilters } from "./components/global-filters"
import { OverdueInvoicesList } from "./components/overdue-invoices-list"
import { TopCustomersByOutstanding } from "./components/top-customers-outstanding"
import { TopCustomersByRevenue } from "./components/top-customers-revenue"

export default function Dashboard2Page() {
  const [agingAsOfDate, setAgingAsOfDate] = useState(new Date())
  const [selectedSalesperson, setSelectedSalesperson] = useState("")
  const [selectedCustomerSegments, setSelectedCustomerSegments] = useState<
    string[]
  >([])
  const [includeCreditHold, setIncludeCreditHold] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  })

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Accounts Receivable & Collections
          </h1>
          <p className="text-muted-foreground">
            Optimize working capital through comprehensive AR visibility and
            proactive collections
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <GlobalFilters
            agingAsOfDate={agingAsOfDate}
            onAgingAsOfDateChangeAction={setAgingAsOfDate}
            selectedSalesperson={selectedSalesperson}
            onSalespersonChangeAction={setSelectedSalesperson}
            selectedCustomerSegments={selectedCustomerSegments}
            onCustomerSegmentsChangeAction={setSelectedCustomerSegments}
            includeCreditHold={includeCreditHold}
            onIncludeCreditHoldChangeAction={setIncludeCreditHold}
            dateRange={dateRange}
            onDateRangeChangeAction={setDateRange}
          />
          <Button variant="outline" className="w-full sm:w-auto">
            <FilterIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <DownloadIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Last Refreshed Indicator */}
      <div className="flex justify-end">
        <span className="text-muted-foreground text-xs">
          Last refreshed: {new Date().toLocaleString()}
        </span>
      </div>

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* Top Row - AR Aging Summary and Collection Effectiveness */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ARAgingSummary
              agingAsOfDate={agingAsOfDate}
              salesperson={selectedSalesperson}
              customerSegments={selectedCustomerSegments}
              includeCreditHold={includeCreditHold}
            />
          </div>
          <div>
            <CollectionEffectivenessIndex
              dateRange={dateRange}
              salesperson={selectedSalesperson}
              customerSegments={selectedCustomerSegments}
            />
          </div>
        </div>

        {/* Second Row - Top Customers */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopCustomersByOutstanding
            agingAsOfDate={agingAsOfDate}
            salesperson={selectedSalesperson}
            customerSegments={selectedCustomerSegments}
            includeCreditHold={includeCreditHold}
          />
          <TopCustomersByRevenue
            dateRange={dateRange}
            salesperson={selectedSalesperson}
            customerSegments={selectedCustomerSegments}
            includeCreditHold={includeCreditHold}
          />
        </div>

        {/* Third Row - Credit Alerts and DSO Trend */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CreditLimitAlerts
            agingAsOfDate={agingAsOfDate}
            salesperson={selectedSalesperson}
            customerSegments={selectedCustomerSegments}
            includeCreditHold={includeCreditHold}
          />
          <DSOTrendAnalysis
            dateRange={dateRange}
            salesperson={selectedSalesperson}
            customerSegments={selectedCustomerSegments}
            includeCreditHold={includeCreditHold}
          />
        </div>

        {/* Fourth Row - Overdue Invoices List (Full Width) */}
        <div>
          <OverdueInvoicesList
            agingAsOfDate={agingAsOfDate}
            salesperson={selectedSalesperson}
            customerSegments={selectedCustomerSegments}
            includeCreditHold={includeCreditHold}
          />
        </div>
      </div>
    </div>
  )
}
