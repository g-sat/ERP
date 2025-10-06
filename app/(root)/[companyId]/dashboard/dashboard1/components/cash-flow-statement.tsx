"use client"

import { useMemo } from "react"
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface CashFlowStatementProps {
  period: string
  comparisonPeriod: string
}

interface CashFlowData {
  beginningCash: number
  cashFromOperations: number
  cashFromInvesting: number
  cashFromFinancing: number
  otherCashFlows: number
  endingCash: number
  budgetedOperations: number
  budgetedInvesting: number
  budgetedFinancing: number
  period: string
}

export function CashFlowStatement({ period }: CashFlowStatementProps) {
  // Mock data - in real implementation, this would come from API
  const mockData: CashFlowData = useMemo(() => {
    const baseAmount =
      period === "qtd" ? 2500000 : period === "ytd" ? 15000000 : 850000

    return {
      beginningCash: baseAmount * 2,
      cashFromOperations: baseAmount * 1.5,
      cashFromInvesting: -baseAmount * 0.8,
      cashFromFinancing: baseAmount * 0.3,
      otherCashFlows: baseAmount * 0.1,
      endingCash: baseAmount * 3,
      budgetedOperations: baseAmount * 1.3,
      budgetedInvesting: -baseAmount * 0.6,
      budgetedFinancing: baseAmount * 0.4,
      period:
        period === "mtd"
          ? "Month-to-Date"
          : period === "qtd"
            ? "Quarter-to-Date"
            : "Year-to-Date",
    }
  }, [period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCashFlowColor = (amount: number) => {
    return amount >= 0 ? "text-green-600" : "text-red-600"
  }

  const getCashFlowBgColor = (amount: number) => {
    return amount >= 0 ? "bg-green-100" : "bg-red-100"
  }

  const getCashFlowIcon = (amount: number) => {
    return amount >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    )
  }

  const getVarianceColor = (actual: number, budgeted: number) => {
    const variance = ((actual - budgeted) / Math.abs(budgeted)) * 100
    if (variance >= 10) return "text-green-600"
    if (variance <= -10) return "text-red-600"
    return "text-yellow-600"
  }

  const getVarianceText = (actual: number, budgeted: number) => {
    const variance = ((actual - budgeted) / Math.abs(budgeted)) * 100
    const varianceAmount = actual - budgeted
    return `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}% (${varianceAmount >= 0 ? "+" : ""}${formatCurrency(varianceAmount)})`
  }

  const isLoading = false // Would be managed by parent component

  const cashFlowCategories = [
    {
      name: "Cash from Operations",
      amount: mockData.cashFromOperations,
      budgeted: mockData.budgetedOperations,
      color: "bg-blue-500",
      description: "Operating activities cash flow",
    },
    {
      name: "Cash from Investing",
      amount: mockData.cashFromInvesting,
      budgeted: mockData.budgetedInvesting,
      color: "bg-purple-500",
      description: "Investment activities cash flow",
    },
    {
      name: "Cash from Financing",
      amount: mockData.cashFromFinancing,
      budgeted: mockData.budgetedFinancing,
      color: "bg-orange-500",
      description: "Financing activities cash flow",
    },
    {
      name: "Other Cash Flows",
      amount: mockData.otherCashFlows,
      budgeted: mockData.otherCashFlows * 1.1,
      color: "bg-gray-500",
      description: "Other cash flow activities",
    },
  ]

  const maxAmount = Math.max(
    ...cashFlowCategories.map((cat) => Math.abs(cat.amount)),
    Math.abs(mockData.beginningCash),
    Math.abs(mockData.endingCash)
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
          <CardDescription>
            Movement of cash from operating, investing, and financing activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
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
              <DollarSign className="h-5 w-5" />
              Cash Flow Statement ({mockData.period})
            </CardTitle>
            <CardDescription>
              Movement of cash from operating, investing, and financing
              activities
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            vs Budget
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Waterfall Chart */}
        <div className="space-y-4">
          {/* Beginning Cash */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-blue-500"></div>
              <div>
                <div className="font-medium">Beginning Cash</div>
                <div className="text-muted-foreground text-sm">
                  Starting cash position
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(mockData.beginningCash)}
              </div>
            </div>
          </div>

          {/* Cash Flow Categories */}
          {cashFlowCategories.map((category, index) => {
            const barWidth = (Math.abs(category.amount) / maxAmount) * 100
            const isPositive = category.amount >= 0

            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 ${category.color} rounded`}></div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {category.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${getCashFlowColor(category.amount)}`}
                    >
                      {category.amount >= 0 ? "+" : ""}
                      {formatCurrency(category.amount)}
                    </div>
                    <div
                      className={`text-xs ${getVarianceColor(category.amount, category.budgeted)}`}
                    >
                      vs Budget:{" "}
                      {getVarianceText(category.amount, category.budgeted)}
                    </div>
                  </div>
                </div>

                {/* Waterfall Bar */}
                <div className="relative h-8 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className={`absolute top-0 h-full ${category.color} transition-all duration-500 ease-in-out ${
                      isPositive ? "left-0" : "right-0"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white mix-blend-difference">
                      {category.amount >= 0 ? "+" : ""}
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                </div>

                {/* Budget Comparison Line */}
                <div className="relative h-1 rounded bg-gray-200">
                  <div
                    className="absolute top-0 h-full bg-gray-400 opacity-60 transition-all duration-500 ease-in-out"
                    style={{
                      width: `${(Math.abs(category.budgeted) / maxAmount) * 100}%`,
                    }}
                  />
                  <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center">
                    <span className="bg-white px-1 text-xs text-gray-500">
                      Budget
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Ending Cash */}
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-green-500"></div>
              <div>
                <div className="font-medium">Ending Cash</div>
                <div className="text-muted-foreground text-sm">
                  Final cash position
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(mockData.endingCash)}
              </div>
              <div className="text-muted-foreground text-xs">
                Change:{" "}
                {mockData.endingCash >= mockData.beginningCash ? "+" : ""}
                {formatCurrency(mockData.endingCash - mockData.beginningCash)}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Net Cash Flow
            </div>
            <div
              className={`text-xl font-bold ${getCashFlowColor(mockData.endingCash - mockData.beginningCash)}`}
            >
              {mockData.endingCash >= mockData.beginningCash ? "+" : ""}
              {formatCurrency(mockData.endingCash - mockData.beginningCash)}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Operating Cash Flow
            </div>
            <div
              className={`text-xl font-bold ${getCashFlowColor(mockData.cashFromOperations)}`}
            >
              {mockData.cashFromOperations >= 0 ? "+" : ""}
              {formatCurrency(mockData.cashFromOperations)}
            </div>
          </div>
        </div>

        {/* Drill-down Action */}
        <div className="border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              // Navigate to detailed cash flow report
            }}
          >
            View Detailed Cash Flow Report →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
