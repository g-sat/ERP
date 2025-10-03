"use client"

import { useMemo } from "react"
import { TrendingDown, TrendingUp, BarChart3 } from "lucide-react"

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

interface PLPerformanceProps {
  period: string
  comparisonPeriod: string
  entities: string[]
}

interface PLCategory {
  name: string
  currentPeriod: number
  priorPeriod: number
  variance: number
  variancePercentage: number
  color: string
  isPositive: boolean // Whether higher values are better for this category
}

export function PLPerformance({
  period,
  comparisonPeriod,
  entities,
}: PLPerformanceProps) {
  // Mock data - in real implementation, this would come from API
  const mockData: PLCategory[] = useMemo(() => {
    const baseAmount = period === "qtd" ? 2500000 : period === "ytd" ? 15000000 : 850000
    
    const categories = [
      { name: "Revenue", base: baseAmount * 2, isPositive: true },
      { name: "COGS", base: baseAmount * 1.2, isPositive: false },
      { name: "Gross Profit", base: baseAmount * 0.8, isPositive: true },
      { name: "Operating Expenses", base: baseAmount * 0.6, isPositive: false },
      { name: "EBITDA", base: baseAmount * 0.3, isPositive: true },
      { name: "Net Income", base: baseAmount * 0.2, isPositive: true },
    ]

    return categories.map((category, index) => {
      const currentPeriodAmount = category.base * (0.9 + Math.random() * 0.2)
      const priorPeriodAmount = category.base * (0.85 + Math.random() * 0.3)
      const variance = currentPeriodAmount - priorPeriodAmount
      const variancePercentage = (variance / Math.abs(priorPeriodAmount)) * 100

      return {
        name: category.name,
        currentPeriod: currentPeriodAmount,
        priorPeriod: priorPeriodAmount,
        variance,
        variancePercentage,
        color: index === 0 ? "bg-blue-500" : 
               index === 1 ? "bg-red-500" : 
               index === 2 ? "bg-green-500" : 
               index === 3 ? "bg-orange-500" : 
               index === 4 ? "bg-purple-500" : "bg-emerald-500",
        isPositive: category.isPositive,
      }
    })
  }, [period, comparisonPeriod, entities])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getVarianceColor = (variancePercentage: number, isPositive: boolean) => {
    // For categories where higher is better (Revenue, Gross Profit, etc.)
    if (isPositive) {
      return variancePercentage >= 0 ? "text-green-600" : "text-red-600"
    }
    // For categories where lower is better (COGS, Operating Expenses)
    return variancePercentage <= 0 ? "text-green-600" : "text-red-600"
  }

  const getVarianceIcon = (variancePercentage: number, isPositive: boolean) => {
    if (isPositive) {
      return variancePercentage >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
    }
    return variancePercentage <= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
  }

  const getComparisonPeriodName = () => {
    switch (comparisonPeriod) {
      case "prior-period":
        return "Prior Period"
      case "prior-year":
        return "Prior Year"
      case "budget":
        return "Budget"
      default:
        return "Prior Period"
    }
  }

  const maxAmount = Math.max(
    ...mockData.map(cat => Math.max(cat.currentPeriod, cat.priorPeriod))
  )

  const isLoading = false // Would be managed by parent component

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>P&L Performance vs Prior Period</CardTitle>
          <CardDescription>
            Profitability trends and significant income/expense variances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              P&L Performance vs {getComparisonPeriodName()}
            </CardTitle>
            <CardDescription>
              Profitability trends and significant income/expense variances
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {period === "mtd" ? "Month-to-Date" : period === "qtd" ? "Quarter-to-Date" : "Year-to-Date"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clustered Bar Chart */}
        <div className="space-y-4">
          {mockData.map((category, index) => {
            const currentBarWidth = (Math.abs(category.currentPeriod) / maxAmount) * 100
            const priorBarWidth = (Math.abs(category.priorPeriod) / maxAmount) * 100
            const varianceColor = getVarianceColor(category.variancePercentage, category.isPositive)
            const varianceIcon = getVarianceIcon(category.variancePercentage, category.isPositive)

            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${category.color} rounded`}></div>
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(category.currentPeriod)}
                      </div>
                      <div className="text-xs text-muted-foreground">Current</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-muted-foreground">
                        {formatCurrency(category.priorPeriod)}
                      </div>
                      <div className="text-xs text-muted-foreground">Prior</div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className={`font-bold flex items-center gap-1 ${varianceColor}`}>
                        {varianceIcon}
                        {category.variancePercentage >= 0 ? "+" : ""}
                        {category.variancePercentage.toFixed(1)}%
                      </div>
                      <div className={`text-xs ${varianceColor}`}>
                        {category.variance >= 0 ? "+" : ""}
                        {formatCurrency(category.variance)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clustered Bars */}
                <div className="space-y-1">
                  {/* Current Period Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Current</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full ${category.color} transition-all duration-500 ease-in-out`}
                        style={{ width: `${currentBarWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {formatCurrency(category.currentPeriod)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prior Period Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Prior</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-gray-400 transition-all duration-500 ease-in-out"
                        style={{ width: `${priorBarWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {formatCurrency(category.priorPeriod)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variance Indicator */}
                <div className={`flex items-center justify-center p-1 rounded text-xs ${varianceColor} bg-opacity-10`}>
                  <div className="flex items-center gap-1">
                    {varianceIcon}
                    <span>
                      {category.isPositive ? "Higher is better" : "Lower is better"} • 
                      Variance: {category.variancePercentage >= 0 ? "+" : ""}
                      {category.variancePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Revenue Growth
            </div>
            <div className={`text-xl font-bold ${getVarianceColor(mockData[0].variancePercentage, true)}`}>
              {mockData[0].variancePercentage >= 0 ? "+" : ""}
              {mockData[0].variancePercentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Net Income Growth
            </div>
            <div className={`text-xl font-bold ${getVarianceColor(mockData[5].variancePercentage, true)}`}>
              {mockData[5].variancePercentage >= 0 ? "+" : ""}
              {mockData[5].variancePercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Drill-down Action */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => {
              // Navigate to P&L Detail Report
              console.log("Navigate to P&L Detail Report")
            }}
          >
            View P&L Detail Report →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
