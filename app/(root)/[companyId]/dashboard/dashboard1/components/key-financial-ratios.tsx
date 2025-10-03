"use client"

import { useMemo } from "react"
import { Calculator, Info, TrendingDown, TrendingUp } from "lucide-react"

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface KeyFinancialRatiosProps {
  period: string
  comparisonPeriod: string
  entities: string[]
}

interface FinancialRatio {
  name: string
  currentValue: number
  priorValue: number
  change: number
  changePercentage: number
  unit: string
  formula: string
  description: string
  historicalData: number[]
  benchmark: {
    excellent: number
    good: number
    poor: number
  }
  isHigherBetter: boolean
}

export function KeyFinancialRatios({
  period,
  comparisonPeriod,
  entities,
}: KeyFinancialRatiosProps) {
  // Mock data - in real implementation, this would come from API
  const mockData: FinancialRatio[] = useMemo(() => {
    const ratios = [
      {
        name: "Current Ratio",
        current: 1.65,
        prior: 1.5,
        formula: "Current Assets / Current Liabilities",
        description:
          "Measures short-term liquidity and ability to pay current obligations",
        benchmark: { excellent: 2.0, good: 1.5, poor: 1.0 },
        isHigherBetter: true,
      },
      {
        name: "Quick Ratio",
        current: 1.25,
        prior: 1.15,
        formula:
          "(Cash + Marketable Securities + Net Receivables) / Current Liabilities",
        description:
          "More stringent measure of short-term liquidity excluding inventory",
        benchmark: { excellent: 1.5, good: 1.0, poor: 0.5 },
        isHigherBetter: true,
      },
      {
        name: "Debt-to-Equity",
        current: 0.45,
        prior: 0.52,
        formula: "Total Liabilities / Total Shareholders' Equity",
        description: "Measures financial leverage and risk level",
        benchmark: { excellent: 0.3, good: 0.5, poor: 1.0 },
        isHigherBetter: false,
      },
      {
        name: "Gross Margin %",
        current: 42.5,
        prior: 38.2,
        formula: "((Revenue - COGS) / Revenue) × 100",
        description: "Percentage of revenue remaining after direct costs",
        benchmark: { excellent: 50, good: 35, poor: 20 },
        isHigherBetter: true,
      },
      {
        name: "Operating Cash Flow Ratio",
        current: 0.85,
        prior: 0.72,
        formula: "Cash from Operations / Current Liabilities",
        description:
          "Ability to cover current liabilities with operating cash flow",
        benchmark: { excellent: 1.0, good: 0.8, poor: 0.5 },
        isHigherBetter: true,
      },
      {
        name: "Return on Equity",
        current: 18.5,
        prior: 15.2,
        formula: "Net Income / Average Shareholders' Equity × 100",
        description: "Return generated on shareholders' investment",
        benchmark: { excellent: 20, good: 15, poor: 10 },
        isHigherBetter: true,
      },
    ]

    return ratios.map((ratio, index) => {
      const change = ratio.current - ratio.prior
      const changePercentage = (change / ratio.prior) * 100

      // Generate historical data (12 months)
      const historicalData = Array.from({ length: 12 }, (_, i) => {
        const baseValue = ratio.prior
        const trend = (ratio.current - ratio.prior) / 12
        const noise = (Math.random() - 0.5) * ratio.prior * 0.1
        return baseValue + trend * i + noise
      })

      return {
        name: ratio.name,
        currentValue: ratio.current,
        priorValue: ratio.prior,
        change,
        changePercentage,
        unit:
          ratio.name.includes("%") || ratio.name.includes("Margin") ? "%" : "x",
        formula: ratio.formula,
        description: ratio.description,
        historicalData,
        benchmark: ratio.benchmark,
        isHigherBetter: ratio.isHigherBetter,
      }
    })
  }, [period, comparisonPeriod, entities])

  const getPerformanceLevel = (
    value: number,
    benchmark: FinancialRatio["benchmark"],
    isHigherBetter: boolean
  ) => {
    if (isHigherBetter) {
      if (value >= benchmark.excellent) return "excellent"
      if (value >= benchmark.good) return "good"
      return "poor"
    } else {
      if (value <= benchmark.excellent) return "excellent"
      if (value <= benchmark.good) return "good"
      return "poor"
    }
  }

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-600 bg-green-50"
      case "good":
        return "text-yellow-600 bg-yellow-50"
      case "poor":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getChangeColor = (change: number, isHigherBetter: boolean) => {
    const isPositiveChange = isHigherBetter ? change > 0 : change < 0
    return isPositiveChange ? "text-green-600" : "text-red-600"
  }

  const getChangeIcon = (change: number, isHigherBetter: boolean) => {
    const isPositiveChange = isHigherBetter ? change > 0 : change < 0
    return isPositiveChange ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    )
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") {
      return `${value.toFixed(1)}%`
    }
    return value.toFixed(2)
  }

  const isLoading = false // Would be managed by parent component

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Ratios</CardTitle>
          <CardDescription>
            Critical financial health indicators with historical context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
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
              <Calculator className="h-5 w-5" />
              Key Financial Ratios
            </CardTitle>
            <CardDescription>
              Critical financial health indicators with historical context
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockData.map((ratio, index) => {
          const performanceLevel = getPerformanceLevel(
            ratio.currentValue,
            ratio.benchmark,
            ratio.isHigherBetter
          )
          const performanceColor = getPerformanceColor(performanceLevel)
          const changeColor = getChangeColor(ratio.change, ratio.isHigherBetter)
          const changeIcon = getChangeIcon(ratio.change, ratio.isHigherBetter)

          // Simple sparkline calculation
          const minValue = Math.min(...ratio.historicalData)
          const maxValue = Math.max(...ratio.historicalData)
          const range = maxValue - minValue

          return (
            <div
              key={ratio.name}
              className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
              onClick={() => {
                // Show detailed ratio analysis popover
                console.log(`Show detailed analysis for ${ratio.name}`)
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ratio.name}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <Info className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <div className="font-medium">{ratio.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {ratio.description}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Formula:</span>{" "}
                          {ratio.formula}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Benchmarks:</span>{" "}
                          Excellent:{" "}
                          {formatValue(ratio.benchmark.excellent, ratio.unit)},
                          Good: {formatValue(ratio.benchmark.good, ratio.unit)},
                          Poor: {formatValue(ratio.benchmark.poor, ratio.unit)}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${performanceColor}`}
                >
                  {performanceLevel.charAt(0).toUpperCase() +
                    performanceLevel.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {formatValue(ratio.currentValue, ratio.unit)}
                    </span>
                    <div className={`flex items-center gap-1 ${changeColor}`}>
                      {changeIcon}
                      <span className="text-sm">
                        {ratio.changePercentage >= 0 ? "+" : ""}
                        {ratio.changePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Prior: {formatValue(ratio.priorValue, ratio.unit)}
                  </div>
                </div>

                {/* Mini Sparkline */}
                <div className="h-8 w-16">
                  <svg className="h-full w-full" viewBox="0 0 64 32">
                    <polyline
                      fill="none"
                      stroke={changeColor}
                      strokeWidth="1.5"
                      points={ratio.historicalData
                        .map((value, i) => {
                          const x = (i / (ratio.historicalData.length - 1)) * 64
                          const y = 32 - ((value - minValue) / range) * 32
                          return `${x},${y}`
                        })
                        .join(" ")}
                    />
                    <circle
                      cx={64}
                      cy={32 - ((ratio.currentValue - minValue) / range) * 32}
                      r="2"
                      fill={changeColor}
                    />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}

        {/* Drill-down Action */}
        <div className="border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              // Navigate to comprehensive financial ratios analysis
              console.log("Navigate to Financial Ratios Analysis")
            }}
          >
            View Comprehensive Analysis →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
