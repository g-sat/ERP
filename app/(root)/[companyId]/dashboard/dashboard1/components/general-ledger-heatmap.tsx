"use client"

import { useMemo, useState } from "react"
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface GeneralLedgerHeatmapProps {
  period: string
  comparisonPeriod: string
  entities: string[]
}

interface GLAccountActivity {
  accountId: string
  accountName: string
  accountCode: string
  transactionCount: number
  absoluteBalanceChange: number
  variancePercentage: number
  accountType: string
}

export function GeneralLedgerHeatmap({
  period,
  comparisonPeriod,
  entities,
}: GeneralLedgerHeatmapProps) {
  const [viewMode, setViewMode] = useState<
    "transaction-count" | "balance-change"
  >("balance-change")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - in real implementation, this would come from API
  const mockData: GLAccountActivity[] = useMemo(() => {
    const accounts = [
      { name: "Cash - Operating", code: "1000", type: "Asset" },
      { name: "Accounts Receivable", code: "1100", type: "Asset" },
      { name: "Inventory", code: "1200", type: "Asset" },
      { name: "Accounts Payable", code: "2000", type: "Liability" },
      { name: "Accrued Expenses", code: "2100", type: "Liability" },
      { name: "Software Expense", code: "5000", type: "Expense" },
      { name: "Office Supplies", code: "5100", type: "Expense" },
      { name: "Professional Services", code: "5200", type: "Expense" },
      { name: "Sales Revenue", code: "4000", type: "Revenue" },
      { name: "Service Revenue", code: "4100", type: "Revenue" },
    ]

    return accounts
      .map((account, index) => {
        const baseActivity =
          period === "qtd" ? 150 : period === "ytd" ? 450 : 45
        const transactionCount = Math.floor(
          baseActivity * (0.8 + Math.random() * 0.4)
        )
        const absoluteBalanceChange = Math.floor(
          transactionCount * (500 + Math.random() * 2000)
        )
        const variancePercentage = (Math.random() - 0.5) * 100 // -50% to +50%

        return {
          accountId: `acc-${index + 1}`,
          accountName: account.name,
          accountCode: account.code,
          transactionCount,
          absoluteBalanceChange,
          variancePercentage,
          accountType: account.type,
        }
      })
      .sort((a, b) => {
        if (viewMode === "transaction-count") {
          return b.transactionCount - a.transactionCount
        }
        return b.absoluteBalanceChange - a.absoluteBalanceChange
      })
      .slice(0, 10) // Top 10 accounts
  }, [period, viewMode, entities])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 20) return "text-red-600 bg-red-50"
    if (variance > 10) return "text-orange-600 bg-orange-50"
    if (variance < -20) return "text-blue-600 bg-blue-50"
    if (variance < -10) return "text-blue-500 bg-blue-50"
    return "text-gray-600 bg-gray-50"
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 10) return <TrendingUp className="h-3 w-3" />
    if (variance < -10) return <TrendingDown className="h-3 w-3" />
    return null
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "Asset":
        return "bg-blue-100 text-blue-800"
      case "Liability":
        return "bg-red-100 text-red-800"
      case "Revenue":
        return "bg-green-100 text-green-800"
      case "Expense":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const maxValue = Math.max(
    ...mockData.map((account) =>
      viewMode === "transaction-count"
        ? account.transactionCount
        : account.absoluteBalanceChange
    )
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Ledger Activity Heatmap</CardTitle>
          <CardDescription>
            Most active or volatile GL accounts requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              General Ledger Activity Heatmap
            </CardTitle>
            <CardDescription>
              Most active or volatile GL accounts requiring attention
            </CardDescription>
          </div>
          <Select
            value={viewMode}
            onValueChange={(value: "transaction-count" | "balance-change") =>
              setViewMode(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transaction-count">
                Transaction Count
              </SelectItem>
              <SelectItem value="balance-change">Balance Change</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockData.map((account, index) => {
          const currentValue =
            viewMode === "transaction-count"
              ? account.transactionCount
              : account.absoluteBalanceChange
          const barWidth = (currentValue / maxValue) * 100

          return (
            <div
              key={account.accountId}
              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-4 rounded-lg border p-3 transition-colors"
              onClick={() => {
                // Navigate to Account Ledger for this specific account
              }}
            >
              {/* Account Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {account.accountName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {account.accountCode}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getAccountTypeColor(account.accountType)}`}
                  >
                    {account.accountType}
                  </Badge>
                </div>

                {/* Value and Variance */}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">
                    {viewMode === "transaction-count"
                      ? currentValue.toLocaleString()
                      : formatCurrency(currentValue)}
                  </span>
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getVarianceColor(account.variancePercentage)}`}
                  >
                    {getVarianceIcon(account.variancePercentage)}
                    <span>
                      {account.variancePercentage >= 0 ? "+" : ""}
                      {account.variancePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="bg-muted h-6 w-32 overflow-hidden rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}

        {/* Drill-down Action */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              // Navigate to full GL Activity Report
            }}
          >
            View All GL Accounts →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
