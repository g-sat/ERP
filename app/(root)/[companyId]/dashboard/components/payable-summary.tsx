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

interface PayableSummaryProps {
  totalSuppliers: number
  activeSuppliers: number
  totalPayables: number
  currentPayables: number
  dueAmount: number
  net30Days: number
  net15Days: number
  net45Days: number
}

export function PayableSummary({
  totalSuppliers,
  activeSuppliers,
  totalPayables,
  currentPayables,
  dueAmount,
  net30Days,
  net15Days,
  net45Days,
}: PayableSummaryProps) {
  const activePercentage =
    totalSuppliers > 0 ? (activeSuppliers / totalSuppliers) * 100 : 0
  const currentPercentage =
    totalPayables > 0 ? (currentPayables / totalPayables) * 100 : 0
  const duePercentage =
    totalPayables > 0 ? (dueAmount / totalPayables) * 100 : 0

  return (
    <div className="space-y-6">
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
              ${totalPayables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Outstanding amount</p>
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
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-muted-foreground text-xs">
              {activePercentage.toFixed(1)}% of {totalSuppliers} total
            </p>
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
              ${currentPayables.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {currentPercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Amount</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${dueAmount.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {duePercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Status Distribution</CardTitle>
            <CardDescription>
              Active vs Inactive suppliers breakdown
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
                  {activeSuppliers} suppliers
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
                  {totalSuppliers - activeSuppliers} suppliers
                </span>
              </div>
              <Progress value={100 - activePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payables Status</CardTitle>
            <CardDescription>Current vs Due payables breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Current</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ${currentPayables.toLocaleString()}
                </span>
              </div>
              <Progress value={currentPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Due</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ${dueAmount.toLocaleString()}
                </span>
              </div>
              <Progress value={duePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Terms Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Terms Distribution</CardTitle>
          <CardDescription>
            Distribution of supplier payment terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net 30 Days</span>
                <span className="text-muted-foreground text-sm">
                  {net30Days} suppliers (60%)
                </span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net 15 Days</span>
                <span className="text-muted-foreground text-sm">
                  {net15Days} suppliers (25%)
                </span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net 45 Days</span>
                <span className="text-muted-foreground text-sm">
                  {net45Days} suppliers (15%)
                </span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Performance */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-muted-foreground text-xs">On-time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Payment Days
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-muted-foreground text-xs">Days to pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Late Payment Rate
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5%</div>
            <p className="text-muted-foreground text-xs">Late payments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
