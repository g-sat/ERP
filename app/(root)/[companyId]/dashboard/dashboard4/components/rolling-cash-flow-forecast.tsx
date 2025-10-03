"use client"

import { useState } from "react"
import {
  AlertTriangleIcon,
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RollingCashFlowForecastProps {
  period: string
  comparisonPeriod: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface CashFlowData {
  week: string
  date: string
  projectedBalance: number
  optimistic: number
  pessimistic: number
  cashIn: number
  cashOut: number
  netCashFlow: number
  confidence: number
}

interface CashFlowMetrics {
  currentBalance: number
  minRequiredBalance: number
  projectedBalance30Days: number
  projectedBalance90Days: number
  avgDailyCashIn: number
  avgDailyCashOut: number
  dso: number
  dpo: number
  liquidityRatio: number
}

export function RollingCashFlowForecast({
  period,
  comparisonPeriod,
  businessUnits,
  productLines,
  geography,
}: RollingCashFlowForecastProps) {
  const [selectedScenario, setSelectedScenario] = useState<
    "base" | "optimistic" | "pessimistic"
  >("base")
  const [forecastPeriod, setForecastPeriod] = useState<"30" | "60" | "90">("90")

  // Mock data - in real implementation, this would come from API
  const cashFlowData: CashFlowData[] = [
    {
      week: "W1",
      date: "2024-01-01",
      projectedBalance: 8500000,
      optimistic: 9200000,
      pessimistic: 7800000,
      cashIn: 1200000,
      cashOut: 800000,
      netCashFlow: 400000,
      confidence: 85,
    },
    {
      week: "W2",
      date: "2024-01-08",
      projectedBalance: 8900000,
      optimistic: 9600000,
      pessimistic: 8200000,
      cashIn: 1100000,
      cashOut: 750000,
      netCashFlow: 350000,
      confidence: 82,
    },
    {
      week: "W3",
      date: "2024-01-15",
      projectedBalance: 9200000,
      optimistic: 9900000,
      pessimistic: 8500000,
      cashIn: 1350000,
      cashOut: 900000,
      netCashFlow: 450000,
      confidence: 80,
    },
    {
      week: "W4",
      date: "2024-01-22",
      projectedBalance: 9400000,
      optimistic: 10100000,
      pessimistic: 8700000,
      cashIn: 1000000,
      cashOut: 850000,
      netCashFlow: 150000,
      confidence: 78,
    },
    {
      week: "W5",
      date: "2024-01-29",
      projectedBalance: 9550000,
      optimistic: 10250000,
      pessimistic: 8850000,
      cashIn: 1250000,
      cashOut: 700000,
      netCashFlow: 550000,
      confidence: 76,
    },
    {
      week: "W6",
      date: "2024-02-05",
      projectedBalance: 9800000,
      optimistic: 10500000,
      pessimistic: 9100000,
      cashIn: 1150000,
      cashOut: 800000,
      netCashFlow: 350000,
      confidence: 74,
    },
    {
      week: "W7",
      date: "2024-02-12",
      projectedBalance: 10150000,
      optimistic: 10850000,
      pessimistic: 9450000,
      cashIn: 1300000,
      cashOut: 750000,
      netCashFlow: 550000,
      confidence: 72,
    },
    {
      week: "W8",
      date: "2024-02-19",
      projectedBalance: 10400000,
      optimistic: 11100000,
      pessimistic: 9700000,
      cashIn: 1050000,
      cashOut: 900000,
      netCashFlow: 150000,
      confidence: 70,
    },
    {
      week: "W9",
      date: "2024-02-26",
      projectedBalance: 10650000,
      optimistic: 11350000,
      pessimistic: 9950000,
      cashIn: 1400000,
      cashOut: 850000,
      netCashFlow: 550000,
      confidence: 68,
    },
    {
      week: "W10",
      date: "2024-03-05",
      projectedBalance: 10900000,
      optimistic: 11600000,
      pessimistic: 10200000,
      cashIn: 1200000,
      cashOut: 800000,
      netCashFlow: 400000,
      confidence: 66,
    },
    {
      week: "W11",
      date: "2024-03-12",
      projectedBalance: 11150000,
      optimistic: 11850000,
      pessimistic: 10450000,
      cashIn: 1350000,
      cashOut: 750000,
      netCashFlow: 600000,
      confidence: 64,
    },
    {
      week: "W12",
      date: "2024-03-19",
      projectedBalance: 11400000,
      optimistic: 12100000,
      pessimistic: 10700000,
      cashIn: 1100000,
      cashOut: 900000,
      netCashFlow: 200000,
      confidence: 62,
    },
  ]

  const metrics: CashFlowMetrics = {
    currentBalance: 8500000,
    minRequiredBalance: 5000000,
    projectedBalance30Days: 9400000,
    projectedBalance90Days: 11400000,
    avgDailyCashIn: 170000,
    avgDailyCashOut: 120000,
    dso: 42,
    dpo: 38,
    liquidityRatio: 2.4,
  }

  const scenarioData = cashFlowData.map((item) => ({
    ...item,
    projectedBalanceM: item.projectedBalance / 1000000,
    optimisticM: item.optimistic / 1000000,
    pessimisticM: item.pessimistic / 1000000,
    cashInM: item.cashIn / 1000000,
    cashOutM: item.cashOut / 1000000,
    netCashFlowM: item.netCashFlow / 1000000,
  }))

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case "optimistic":
        return "#10b981"
      case "pessimistic":
        return "#ef4444"
      default:
        return "#3b82f6"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
          <p className="font-medium">
            {data.week} - {data.date}
          </p>
          <p className="text-muted-foreground text-sm">
            Projected Balance: ${data.projectedBalanceM.toFixed(1)}M
          </p>
          <p className="text-muted-foreground text-sm">
            Cash In: ${data.cashInM.toFixed(1)}M
          </p>
          <p className="text-muted-foreground text-sm">
            Cash Out: ${data.cashOutM.toFixed(1)}M
          </p>
          <p className="text-muted-foreground text-sm">
            Net Flow: ${data.netCashFlowM.toFixed(1)}M
          </p>
          <p className="text-muted-foreground text-sm">
            Confidence: {data.confidence}%
          </p>
        </div>
      )
    }
    return null
  }

  const isLiquidityRisk =
    metrics.projectedBalance30Days < metrics.minRequiredBalance * 1.2

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSignIcon className="h-5 w-5" />
          Rolling Cash Flow Forecast
          <Badge variant="outline" className="text-xs">
            Liquidity Management
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(metrics.currentBalance / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">Current Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(metrics.projectedBalance30Days / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">30-Day Forecast</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(metrics.projectedBalance90Days / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">90-Day Forecast</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {metrics.liquidityRatio.toFixed(1)}x
            </div>
            <div className="text-muted-foreground text-xs">Liquidity Ratio</div>
          </div>
        </div>

        {/* Scenario Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedScenario === "base" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedScenario("base")}
            className="text-xs"
          >
            Base Case
          </Button>
          <Button
            variant={selectedScenario === "optimistic" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedScenario("optimistic")}
            className="text-xs"
          >
            Optimistic
          </Button>
          <Button
            variant={selectedScenario === "pessimistic" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedScenario("pessimistic")}
            className="text-xs"
          >
            Pessimistic
          </Button>
        </div>

        {/* Forecast Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">Cash Flow Forecast</h4>
            <div className="flex gap-2">
              {["30", "60", "90"].map((period) => (
                <Button
                  key={period}
                  variant={forecastPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setForecastPeriod(period as "30" | "60" | "90")
                  }
                  className="text-xs"
                >
                  {period} days
                </Button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={metrics.minRequiredBalance / 1000000}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Min Required"
                />

                {selectedScenario === "base" && (
                  <Line
                    type="monotone"
                    dataKey="projectedBalanceM"
                    stroke={getScenarioColor("base")}
                    strokeWidth={3}
                    name="Projected Balance"
                  />
                )}

                {selectedScenario === "optimistic" && (
                  <Line
                    type="monotone"
                    dataKey="optimisticM"
                    stroke={getScenarioColor("optimistic")}
                    strokeWidth={3}
                    name="Optimistic"
                  />
                )}

                {selectedScenario === "pessimistic" && (
                  <Line
                    type="monotone"
                    dataKey="pessimisticM"
                    stroke={getScenarioColor("pessimistic")}
                    strokeWidth={3}
                    name="Pessimistic"
                  />
                )}

                {/* Confidence Band */}
                <Area
                  type="monotone"
                  dataKey="optimisticM"
                  stackId="1"
                  stroke="none"
                  fill={getScenarioColor("optimistic")}
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="pessimisticM"
                  stackId="1"
                  stroke="none"
                  fill={getScenarioColor("pessimistic")}
                  fillOpacity={0.1}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Components */}
        <Tabs defaultValue="inflow" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inflow">Cash Inflow</TabsTrigger>
            <TabsTrigger value="outflow">Cash Outflow</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>

          <TabsContent value="inflow">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cashInM" fill="#10b981" name="Cash In ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="outflow">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cashOutM" fill="#ef4444" name="Cash Out ($M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="components">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-4">
                  <h5 className="mb-3 font-medium">Cash Inflow Sources</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        AR Collections
                      </span>
                      <span className="font-medium">
                        ${((metrics.avgDailyCashIn * 0.7) / 1000000).toFixed(1)}
                        M/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        New Sales
                      </span>
                      <span className="font-medium">
                        ${((metrics.avgDailyCashIn * 0.3) / 1000000).toFixed(1)}
                        M/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Other Income
                      </span>
                      <span className="font-medium">
                        ${((metrics.avgDailyCashIn * 0.1) / 1000000).toFixed(1)}
                        M/day
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h5 className="mb-3 font-medium">Cash Outflow Sources</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        AP Payments
                      </span>
                      <span className="font-medium">
                        $
                        {((metrics.avgDailyCashOut * 0.6) / 1000000).toFixed(1)}
                        M/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Payroll
                      </span>
                      <span className="font-medium">
                        $
                        {((metrics.avgDailyCashOut * 0.25) / 1000000).toFixed(
                          1
                        )}
                        M/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Operating Expenses
                      </span>
                      <span className="font-medium">
                        $
                        {((metrics.avgDailyCashOut * 0.15) / 1000000).toFixed(
                          1
                        )}
                        M/day
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Days Sales Outstanding
                </span>
              </div>
              <div className="text-2xl font-bold">{metrics.dso} days</div>
              <div className="text-muted-foreground text-xs">
                Target: 35 days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingDownIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  Days Payable Outstanding
                </span>
              </div>
              <div className="text-2xl font-bold">{metrics.dpo} days</div>
              <div className="text-muted-foreground text-xs">
                Target: 42 days
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">
                  Cash Conversion Cycle
                </span>
              </div>
              <div className="text-2xl font-bold">
                {metrics.dso + 30 - metrics.dpo} days
              </div>
              <div className="text-muted-foreground text-xs">
                Target: 60 days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {isLiquidityRisk && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Liquidity Risk Alert
                </span>
              </div>
              <div className="text-xs text-red-700">
                Projected balance may approach minimum required threshold within
                30 days. Consider accelerating collections or extending payment
                terms.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forecast Assumptions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Forecast Assumptions
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-blue-700 sm:grid-cols-2">
              <div>• DSO improvement: 42 → 38 days over 90 days</div>
              <div>• DPO optimization: 38 → 42 days over 90 days</div>
              <div>• Collection probability: 85% for current AR</div>
              <div>• Seasonal adjustments: Q1 +5% cash inflow</div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
