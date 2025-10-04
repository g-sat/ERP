"use client"

import {
  MinusIcon,
  TargetIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { _Skeleton } from "@/components/ui/skeleton"

interface ExecutiveKPIPanelProps {
  period: string
  comparisonPeriod: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface KPIMetric {
  label: string
  value: string | number
  unit: string
  trend: number
  target?: number
  benchmark?: number
  status: "good" | "warning" | "critical"
  sparkline: number[]
  description: string
}

export function ExecutiveKPIPanel({
  period: _period,
  comparisonPeriod: _comparisonPeriod,
  businessUnits: _businessUnits,
  productLines: _productLines,
  geography: _geography,
}: ExecutiveKPIPanelProps) {
  // Mock data - in real implementation, this would come from API
  const kpiMetrics: KPIMetric[] = [
    {
      label: "Days Sales Outstanding (DSO)",
      value: 42,
      unit: "days",
      trend: -8.2,
      target: 35,
      benchmark: 45,
      status: "warning",
      sparkline: [48, 45, 43, 44, 42, 41, 42],
      description: "Time to collect receivables",
    },
    {
      label: "Days Payable Outstanding (DPO)",
      value: 38,
      unit: "days",
      trend: 5.1,
      target: 42,
      benchmark: 35,
      status: "good",
      sparkline: [35, 36, 37, 36, 37, 38, 38],
      description: "Time to pay suppliers",
    },
    {
      label: "Cash Conversion Cycle",
      value: 67,
      unit: "days",
      trend: -12.3,
      target: 60,
      benchmark: 75,
      status: "good",
      sparkline: [79, 76, 73, 70, 69, 68, 67],
      description: "DSO + DIO - DPO",
    },
    {
      label: "Current Ratio",
      value: 2.4,
      unit: "x",
      trend: 0.3,
      target: 2.0,
      benchmark: 2.5,
      status: "good",
      sparkline: [2.1, 2.2, 2.3, 2.2, 2.3, 2.4, 2.4],
      description: "Liquidity ratio",
    },
    {
      label: "Operating Cash Flow",
      value: 1250000,
      unit: "USD",
      trend: 15.7,
      target: 1000000,
      benchmark: 1200000,
      status: "good",
      sparkline: [800000, 900000, 1000000, 1100000, 1200000, 1250000, 1250000],
      description: "YTD operating cash flow",
    },
    {
      label: "EBITDA Margin",
      value: 18.5,
      unit: "%",
      trend: 2.1,
      target: 16.0,
      benchmark: 20.0,
      status: "good",
      sparkline: [16.4, 16.8, 17.2, 17.6, 18.0, 18.3, 18.5],
      description: "Earnings before interest, taxes, depreciation",
    },
  ]

  const formatValue = (value: string | number, unit: string) => {
    if (typeof value === "number") {
      if (unit === "USD") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      }
      return `${value}${unit}`
    }
    return value
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUpIcon className="h-3 w-3" />
    if (trend < 0) return <TrendingDownIcon className="h-3 w-3" />
    return <MinusIcon className="h-3 w-3" />
  }

  const getTrendColor = (trend: number, metric: string) => {
    // For DSO and CCC, lower is better
    if (metric.includes("DSO") || metric.includes("Cash Conversion")) {
      return trend < 0 ? "text-green-600" : "text-red-600"
    }
    // For others, higher is generally better
    return trend > 0 ? "text-green-600" : "text-red-600"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="h-5 w-5" />
          Executive KPI Panel
          <Badge variant="outline" className="text-xs">
            Strategic Health Indicators
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpiMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm leading-none font-medium">
                      {metric.label}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {metric.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(metric.status)}`}
                  >
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Main Value */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatValue(metric.value, metric.unit)}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-sm ${getTrendColor(
                      metric.trend,
                      metric.label
                    )}`}
                  >
                    {getTrendIcon(metric.trend)}
                    <span className="font-medium">
                      {Math.abs(metric.trend).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Target Progress */}
                {metric.target && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>vs Target</span>
                      <span>
                        {typeof metric.value === "number"
                          ? `${((metric.value / metric.target) * 100).toFixed(0)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <Progress
                      value={
                        typeof metric.value === "number"
                          ? Math.min((metric.value / metric.target) * 100, 100)
                          : 0
                      }
                      className="h-1"
                    />
                  </div>
                )}

                {/* Benchmark Comparison */}
                {metric.benchmark && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Industry Avg:</span>
                    <span className="font-medium">
                      {formatValue(metric.benchmark, metric.unit)}
                    </span>
                  </div>
                )}

                {/* Mini Sparkline */}
                <div className="flex h-6 items-end gap-0.5">
                  {metric.sparkline.map((point, i) => {
                    const max = Math.max(...metric.sparkline)
                    const height = (point / max) * 100
                    return (
                      <div
                        key={i}
                        className="bg-primary/20 flex-1 rounded-sm"
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Insights */}
        <div className="bg-muted/50 mt-6 rounded-lg p-4">
          <h4 className="mb-2 text-sm font-medium">Strategic Insights</h4>
          <div className="text-muted-foreground grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div>• Cash conversion cycle improved by 12.3% vs. prior year</div>
            <div>• Operating cash flow exceeds target by 25%</div>
            <div>• DSO trending down but still above target</div>
            <div>• EBITDA margin approaching industry benchmark</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
