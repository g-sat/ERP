"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  AlertTriangle,
  CalendarIcon,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  TrendingUp,
} from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Import widget components
import APAgingSummary from "./components/ap-aging-summary"
import ApprovalPipeline from "./components/approval-pipeline"
import DiscountTracker from "./components/discount-tracker"
import DPOTrendAnalysis from "./components/dpo-trend-analysis"
import PaymentsCalendar from "./components/payments-calendar"
import TopSuppliersBalance from "./components/top-suppliers-balance"
import TopSuppliersSpend from "./components/top-suppliers-spend"

interface Dashboard3Filters {
  dateRange: DateRange | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

export default function Dashboard3() {
  const [filters, setFilters] = useState<Dashboard3Filters>({
    dateRange: undefined,
    supplierCategory: [],
    paymentTerms: "all",
    approvalStatus: "all",
    legalEntity: [],
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set default date range to current month-to-date
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: firstDayOfMonth,
        to: today,
      },
    }))

    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleFilterChange = (key: keyof Dashboard3Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const supplierCategories = [
    "Raw Materials",
    "IT Services",
    "Professional Services",
    "Equipment",
    "Utilities",
    "Marketing",
    "Office Supplies",
  ]

  const paymentTermsOptions = [
    { value: "all", label: "All Payment Terms" },
    { value: "immediate", label: "Immediate" },
    { value: "net15", label: "Net 15" },
    { value: "net30", label: "Net 30" },
    { value: "net45", label: "Net 45" },
    { value: "net60", label: "Net 60" },
  ]

  const approvalStatusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending Approval" },
    { value: "approved", label: "Approved" },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Accounts Payable & Procurement
          </h1>
          <p className="text-muted-foreground">
            Optimize cash outflow management and strengthen supplier
            relationships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Schedule Payment
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) => handleFilterChange("dateRange", range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Supplier Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Category</label>
              <Select
                value={filters.supplierCategory.join(",")}
                onValueChange={(value) =>
                  handleFilterChange(
                    "supplierCategory",
                    value ? value.split(",") : []
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select categories" />
                </SelectTrigger>
                <SelectContent>
                  {supplierCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Terms</label>
              <Select
                value={filters.paymentTerms}
                onValueChange={(value) =>
                  handleFilterChange("paymentTerms", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermsOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Approval Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Status</label>
              <Select
                value={filters.approvalStatus}
                onValueChange={(value) =>
                  handleFilterChange("approvalStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {approvalStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Legal Entity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Legal Entity</label>
              <Select
                value={filters.legalEntity.join(",")}
                onValueChange={(value) =>
                  handleFilterChange(
                    "legalEntity",
                    value ? value.split(",") : []
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entity1">Entity 1</SelectItem>
                  <SelectItem value="entity2">Entity 2</SelectItem>
                  <SelectItem value="entity3">Entity 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total AP Outstanding
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847,392</div>
            <p className="text-muted-foreground text-xs">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. DPO</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.4 days</div>
            <p className="text-muted-foreground text-xs">
              +2.1 days from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-muted-foreground text-xs">
              12 overdue (&gt;7 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Discount Opportunities
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-muted-foreground text-xs">
              5 opportunities expiring soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Widget 3.1: AP Aging Summary */}
          <APAgingSummary filters={filters} />

          {/* Widget 3.2: Top 10 Suppliers by Outstanding Balance */}
          <TopSuppliersBalance filters={filters} />

          {/* Widget 3.3: Top 10 Suppliers by Spend (YTD) */}
          <TopSuppliersSpend filters={filters} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Widget 3.4: Upcoming Payments Calendar */}
          <PaymentsCalendar filters={filters} />

          {/* Widget 3.5: Early Payment Discount Tracker */}
          <DiscountTracker filters={filters} />
        </div>
      </div>

      {/* Full Width Widgets */}
      <div className="space-y-6">
        {/* Widget 3.6: Invoice Approval Pipeline */}
        <ApprovalPipeline filters={filters} />

        {/* Widget 3.7: DPO Trend Analysis */}
        <DPOTrendAnalysis filters={filters} />
      </div>
    </div>
  )
}
