"use client"

import { useMemo } from "react"
import { AlertTriangle, CheckCircle } from "lucide-react"

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

interface TrialBalanceSnapshotProps {
  period: string
}

interface TrialBalanceData {
  totalDebits: number
  totalCredits: number
  netChange: number
  varianceThreshold: number
  historicalData: Array<{
    period: string
    netChange: number
  }>
  lastUpdated: string
}

export function TrialBalanceSnapshot({ period }: TrialBalanceSnapshotProps) {
  // Mock data - in real implementation, this would come from API
  const mockData: TrialBalanceData = useMemo(() => {
    // Simulate different data based on period
    const baseAmount =
      period === "qtd" ? 2500000 : period === "ytd" ? 15000000 : 850000

    return {
      totalDebits: baseAmount * 1.02,
      totalCredits: baseAmount * 0.98,
      netChange: baseAmount * 0.04, // 4% difference
      varianceThreshold: 1000,
      historicalData: Array.from({ length: 12 }, (_, i) => ({
        period: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 7),
        netChange: baseAmount * (0.02 + Math.random() * 0.06 - 0.03),
      })),
      lastUpdated: new Date().toISOString(),
    }
  }, [period])

  const isLoading = false // Would be managed by parent component
  const hasVariance = Math.abs(mockData.netChange) > mockData.varianceThreshold

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getVarianceIcon = () => {
    if (Math.abs(mockData.netChange) <= mockData.varianceThreshold) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getVarianceColor = () => {
    if (Math.abs(mockData.netChange) <= mockData.varianceThreshold) {
      return "text-green-600"
    }
    return mockData.netChange > 0 ? "text-red-600" : "text-red-600"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance Snapshot</CardTitle>
          <CardDescription>
            Quick check on accounting integrity and period-over-period movement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-16" />
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
              Trial Balance Snapshot
              {getVarianceIcon()}
            </CardTitle>
            <CardDescription>
              Quick check on accounting integrity and period-over-period
              movement
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Updated {new Date(mockData.lastUpdated).toLocaleTimeString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Three Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Total Debits
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(mockData.totalDebits)}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              Current Period
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Total Credits
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockData.totalCredits)}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              Current Period
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Net Change
            </div>
            <div className={`text-2xl font-bold ${getVarianceColor()}`}>
              {mockData.netChange >= 0 ? "+" : ""}
              {formatCurrency(mockData.netChange)}
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              Current Period
            </div>
          </div>
        </div>

        {/* Mini Trend Chart (Sparkline) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Net Change Trend (12 Months)
            </span>
            <div className="flex items-center gap-1">
              {hasVariance ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">Variance Alert</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">Balanced</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-muted/30 h-16 rounded-lg p-2">
            <div className="relative h-full">
              {/* Simple sparkline visualization */}
              <svg className="h-full w-full" viewBox="0 0 300 60">
                <polyline
                  fill="none"
                  stroke={hasVariance ? "#ef4444" : "#10b981"}
                  strokeWidth="2"
                  points={mockData.historicalData
                    .map((point, index) => {
                      const x =
                        (index / (mockData.historicalData.length - 1)) * 300
                      const y =
                        30 -
                        (point.netChange /
                          Math.max(
                            ...mockData.historicalData.map((d) =>
                              Math.abs(d.netChange)
                            )
                          )) *
                          20
                      return `${x},${y}`
                    })
                    .join(" ")}
                />
                <circle
                  cx={300}
                  cy={
                    30 -
                    (mockData.netChange /
                      Math.max(
                        ...mockData.historicalData.map((d) =>
                          Math.abs(d.netChange)
                        )
                      )) *
                      20
                  }
                  r="3"
                  fill={hasVariance ? "#ef4444" : "#10b981"}
                />
              </svg>
            </div>
          </div>

          <div className="text-muted-foreground flex justify-between text-xs">
            <span>{mockData.historicalData[0]?.period}</span>
            <span>
              {
                mockData.historicalData[mockData.historicalData.length - 1]
                  ?.period
              }
            </span>
          </div>
        </div>

        {/* Drill-down Action */}
        <div className="border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              // Navigate to detailed trial balance report
              console.log("Navigate to Detailed Trial Balance Report")
            }}
          >
            Click to view Detailed Trial Balance Report →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
