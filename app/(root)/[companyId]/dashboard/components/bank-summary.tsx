"use client"

import {
  Activity,
  Building2,
  Calculator,
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

interface BankSummaryProps {
  totalBanks: number
  activeBanks: number
  totalBalance: number
  totalDeposits: number
  totalWithdrawals: number
  netCashFlow: number
  currencyDistribution: Record<string, number>
}

export function BankSummary({
  totalBanks,
  activeBanks,
  totalBalance,
  totalDeposits,
  totalWithdrawals,
  netCashFlow,
  currencyDistribution,
}: BankSummaryProps) {
  const activePercentage = totalBanks > 0 ? (activeBanks / totalBanks) * 100 : 0
  const depositPercentage =
    totalBalance > 0 ? (totalDeposits / totalBalance) * 100 : 0
  const withdrawalPercentage =
    totalBalance > 0 ? (totalWithdrawals / totalBalance) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBalance.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banks</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBanks}</div>
            <p className="text-muted-foreground text-xs">
              {activePercentage.toFixed(1)}% of {totalBanks} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${netCashFlow.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Currency Types
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(currencyDistribution).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Different currencies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bank Status Distribution</CardTitle>
            <CardDescription>
              Active vs Inactive banks breakdown
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
                  {activeBanks} banks
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
                  {totalBanks - activeBanks} banks
                </span>
              </div>
              <Progress value={100 - activePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>Deposits vs Withdrawals breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Deposits</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ${totalDeposits.toLocaleString()}
                </span>
              </div>
              <Progress value={depositPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Withdrawals</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ${totalWithdrawals.toLocaleString()}
                </span>
              </div>
              <Progress value={withdrawalPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Distribution</CardTitle>
          <CardDescription>Distribution of banks by currency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(currencyDistribution).map(([currency, count]) => {
              const percentage = totalBanks > 0 ? (count / totalBanks) * 100 : 0
              return (
                <div key={currency} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{currency}</span>
                    <span className="text-muted-foreground text-sm">
                      {count} banks ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Banking Performance */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Balance</CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalBanks > 0
                ? (totalBalance / totalBanks).toLocaleString()
                : 0}
            </div>
            <p className="text-muted-foreground text-xs">Per bank account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transaction Volume
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalDeposits + totalWithdrawals).toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Total activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cash Flow Ratio
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalWithdrawals > 0
                ? (totalDeposits / totalWithdrawals).toFixed(2)
                : "N/A"}
            </div>
            <p className="text-muted-foreground text-xs">
              Deposits/Withdrawals
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
