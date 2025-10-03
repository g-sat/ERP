"use client"

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ReceivableSummaryProps {
  totalCustomers: number
  activeCustomers: number
  totalReceivables: number
  currentReceivables: number
  overdueAmount: number
  creditUtilization: number
}

export function ReceivableSummary({
  totalCustomers,
  activeCustomers,
  totalReceivables,
  currentReceivables,
  overdueAmount,
  creditUtilization,
}: ReceivableSummaryProps) {
  const activePercentage =
    totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0
  const currentPercentage =
    totalReceivables > 0 ? (currentReceivables / totalReceivables) * 100 : 0
  const overduePercentage =
    totalReceivables > 0 ? (overdueAmount / totalReceivables) * 100 : 0

  return (
    <div className="space-y-6">
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
              ${totalReceivables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Outstanding amount</p>
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
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-muted-foreground text-xs">
              {activePercentage.toFixed(1)}% of {totalCustomers} total
            </p>
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
              ${currentReceivables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {currentPercentage.toFixed(1)}% of total
            </p>
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
              ${overdueAmount.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {overduePercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Status Distribution</CardTitle>
            <CardDescription>
              Active vs Inactive customers breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {activeCustomers} customers
                </span>
              </div>
              <Progress value={activePercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {totalCustomers - activeCustomers} customers
                </span>
              </div>
              <Progress value={100 - activePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receivables Status</CardTitle>
            <CardDescription>
              Current vs Overdue receivables breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Current</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ${currentReceivables.toLocaleString()}
                </span>
              </div>
              <Progress value={currentPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ${overdueAmount.toLocaleString()}
                </span>
              </div>
              <Progress value={overduePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Utilization</CardTitle>
          <CardDescription>
            Overall credit limit usage across all customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Credit Utilization</span>
              </div>
              <span className="text-muted-foreground text-sm">
                {creditUtilization.toFixed(1)}%
              </span>
            </div>
            <Progress value={creditUtilization} className="h-2" />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Performance */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Collection Days
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-muted-foreground text-xs">Days to collect</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bad Debt Ratio
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-muted-foreground text-xs">Write-off rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
