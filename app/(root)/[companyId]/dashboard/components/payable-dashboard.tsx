"use client"

import { useMemo, useState } from "react"
import { ISupplier } from "@/interfaces/supplier"
import { useAuthStore } from "@/stores/auth-store"
import {
  _Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  _TrendingUp,
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

import { PayableAnalytics } from "./payable-analytics"
import { PayableSummary } from "./payable-summary"

interface PayableDashboardProps {
  data: ISupplier[]
  isLoading?: boolean
}

export function PayableDashboard({
  data,
  isLoading = false,
}: PayableDashboardProps) {
  const { user } = useAuthStore()

  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedView, setSelectedView] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoized metrics calculation
  const metrics = useMemo(() => {
    const totalSuppliers = data.length
    const activeSuppliers = data.filter((supplier) => supplier.isActive).length
    const inactiveSuppliers = data.filter(
      (supplier) => !supplier.isActive
    ).length

    // Calculate payables (simplified - would need actual payable data)
    const currentPayables = Math.floor(totalSuppliers * 12000) // Mock data
    const due30Days = Math.floor(totalSuppliers * 8000)
    const due60Days = Math.floor(totalSuppliers * 5000)
    const due90Days = Math.floor(totalSuppliers * 3000)

    const totalPayables = currentPayables + due30Days + due60Days + due90Days

    // Payment terms analysis (simplified)
    const net30Days = Math.floor(totalSuppliers * 0.6) // 60% have net 30 terms
    const net15Days = Math.floor(totalSuppliers * 0.25) // 25% have net 15 terms
    const net45Days = Math.floor(totalSuppliers * 0.15) // 15% have net 45 terms

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      currentPayables,
      due30Days,
      due60Days,
      due90Days,
      totalPayables,
      net30Days,
      net15Days,
      net45Days,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Payable Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.userName}. Here&apos;s your payables overview.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search suppliers..."
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
              Total Payables
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalPayables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Payables
            </CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.currentPayables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Not yet due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${metrics.due30Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Due within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Suppliers
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSuppliers}</div>
            <p className="text-muted-foreground text-xs">
              {metrics.totalSuppliers > 0
                ? (
                    (metrics.activeSuppliers / metrics.totalSuppliers) *
                    100
                  ).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">0-30 Days</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.due30Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Due soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">31-60 Days</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.due60Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Due next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">61-90 Days</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${metrics.due90Days.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Net 30</div>
            <p className="text-muted-foreground text-xs">
              {metrics.net30Days} suppliers
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
            {/* Top Suppliers by Payables */}
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers by Payables</CardTitle>
                <CardDescription>
                  Suppliers with highest outstanding amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 5).map((supplier, index) => (
                    <div
                      key={supplier.supplierId}
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
                            {supplier.supplierName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {supplier.supplierCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          ${(Math.random() * 30000 + 5000).toLocaleString()}
                        </span>
                        <Badge
                          variant={supplier.isActive ? "default" : "secondary"}
                        >
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Alerts</CardTitle>
                <CardDescription>
                  Suppliers requiring immediate payment attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 3).map((supplier, index) => (
                    <div
                      key={supplier.supplierId}
                      className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {supplier.supplierName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Due: {15 + index * 5} days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-orange-600">
                          ${(Math.random() * 15000 + 3000).toLocaleString()}
                        </span>
                        <p className="text-muted-foreground text-xs">
                          Due Soon
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <PayableSummary
            totalSuppliers={metrics.totalSuppliers}
            activeSuppliers={metrics.activeSuppliers}
            totalPayables={metrics.totalPayables}
            currentPayables={metrics.currentPayables}
            dueAmount={
              metrics.due30Days + metrics.due60Days + metrics.due90Days
            }
            net30Days={metrics.net30Days}
            net15Days={metrics.net15Days}
            net45Days={metrics.net45Days}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PayableAnalytics data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payable Reports</CardTitle>
              <CardDescription>
                Generate and export detailed payable reports
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
