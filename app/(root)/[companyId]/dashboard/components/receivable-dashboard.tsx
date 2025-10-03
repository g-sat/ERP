"use client"

import { useMemo, useState } from "react"
import { ICustomer } from "@/interfaces/customer"
import { useAuthStore } from "@/stores/auth-store"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ReceivableAnalytics } from "./receivable-analytics"
import { ReceivableSummary } from "./receivable-summary"

interface ReceivableDashboardProps {
  data: ICustomer[]
  isLoading?: boolean
}

export function ReceivableDashboard({
  data,
  isLoading = false,
}: ReceivableDashboardProps) {
  const { user } = useAuthStore()

  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedView, setSelectedView] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoized metrics calculation
  const metrics = useMemo(() => {
    const totalCustomers = data.length
    const activeCustomers = data.filter((customer) => customer.isActive).length
    const inactiveCustomers = data.filter(
      (customer) => !customer.isActive
    ).length

    // Calculate aging (simplified - would need actual receivable data)
    const currentReceivables = Math.floor(totalCustomers * 15000) // Mock data
    const overdue30Days = Math.floor(totalCustomers * 5000)
    const overdue60Days = Math.floor(totalCustomers * 3000)
    const overdue90Days = Math.floor(totalCustomers * 2000)

    const totalReceivables =
      currentReceivables + overdue30Days + overdue60Days + overdue90Days

    // Customer credit limits (simplified)
    const totalCreditLimit = data.reduce((sum, customer) => {
      return sum + (customer.creditLimit || 0)
    }, 0)

    const usedCreditLimit = Math.floor(totalCreditLimit * 0.7) // Mock 70% usage

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      currentReceivables,
      overdue30Days,
      overdue60Days,
      overdue90Days,
      totalReceivables,
      totalCreditLimit,
      usedCreditLimit,
      creditUtilization:
        totalCreditLimit > 0 ? (usedCreditLimit / totalCreditLimit) * 100 : 0,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Receivable Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.userName}. Here&apos;s your receivables
            overview.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-[150px] lg:w-[250px]"
          />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receivables
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalReceivables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Receivables
            </CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.currentReceivables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Not yet due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Amount
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              $
              {(
                metrics.overdue30Days +
                metrics.overdue60Days +
                metrics.overdue90Days
              ).toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Past due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
            <p className="text-muted-foreground text-xs">
              {metrics.totalCustomers > 0
                ? (
                    (metrics.activeCustomers / metrics.totalCustomers) *
                    100
                  ).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">0-30 Days</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.overdue30Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Recently overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${metrics.overdue60Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Moderately overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${metrics.overdue90Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Seriously overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credit Utilization
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.creditUtilization.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              ${metrics.usedCreditLimit.toLocaleString()} of $
              {metrics.totalCreditLimit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Customers by Receivables */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Receivables</CardTitle>
                <CardDescription>
                  Customers with highest outstanding amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 5).map((customer, index) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {customer.customerName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {customer.customerCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          ${(Math.random() * 50000 + 10000).toLocaleString()}
                        </span>
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Alerts</CardTitle>
                <CardDescription>
                  Customers requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 3).map((customer, index) => (
                    <div
                      key={customer.customerId}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {customer.customerName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Overdue: {30 + index * 15} days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-red-600">
                          ${(Math.random() * 20000 + 5000).toLocaleString()}
                        </span>
                        <p className="text-muted-foreground text-xs">Overdue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <ReceivableSummary
            totalCustomers={metrics.totalCustomers}
            activeCustomers={metrics.activeCustomers}
            totalReceivables={metrics.totalReceivables}
            currentReceivables={metrics.currentReceivables}
            overdueAmount={
              metrics.overdue30Days +
              metrics.overdue60Days +
              metrics.overdue90Days
            }
            creditUtilization={metrics.creditUtilization}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ReceivableAnalytics data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receivable Reports</CardTitle>
              <CardDescription>
                Generate and export detailed receivable reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Reporting features coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
