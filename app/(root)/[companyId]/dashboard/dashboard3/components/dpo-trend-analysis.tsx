"use client"

import {
  BarChart3,
  Eye,
  Target,
  TrendingDown,
  TrendingUp,
  _Calendar,
} from "lucide-react"
import {
  Legend,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Dashboard3Filters {
  dateRange: { from: Date; to: Date } | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

interface DPOTrendData {
  quarter: string
  actualDPO: number
  targetDPO: number
  industryBenchmark: number
  avgPaymentTerms: number
  totalAP: number
  cogs: number
  events?: string[]
}

interface DPOTrendAnalysisProps {
  filters: Dashboard3Filters
}

export default function DPOTrendAnalysis({
  filters: _filters,
}: DPOTrendAnalysisProps) {
  // Mock data - replace with actual API call
  const dpoTrendData: DPOTrendData[] = [
    {
      quarter: "Q1 2023",
      actualDPO: 28.5,
      targetDPO: 30,
      industryBenchmark: 32,
      avgPaymentTerms: 29,
      totalAP: 2450000,
      cogs: 8500000,
      events: ["New payment terms implemented"],
    },
    {
      quarter: "Q2 2023",
      actualDPO: 31.2,
      targetDPO: 30,
      industryBenchmark: 32,
      avgPaymentTerms: 31,
      totalAP: 2680000,
      cogs: 9200000,
    },
    {
      quarter: "Q3 2023",
      actualDPO: 29.8,
      targetDPO: 30,
      industryBenchmark: 32,
      avgPaymentTerms: 30,
      totalAP: 2510000,
      cogs: 8800000,
    },
    {
      quarter: "Q4 2023",
      actualDPO: 32.4,
      targetDPO: 30,
      industryBenchmark: 32,
      avgPaymentTerms: 32,
      totalAP: 2890000,
      cogs: 8950000,
      events: ["Holiday season impact"],
    },
    {
      quarter: "Q1 2024",
      actualDPO: 30.1,
      targetDPO: 30,
      industryBenchmark: 32,
      avgPaymentTerms: 30,
      totalAP: 2650000,
      cogs: 9100000,
    },
  ]

  const currentDPO = dpoTrendData[dpoTrendData.length - 1].actualDPO
  const targetDPO = dpoTrendData[dpoTrendData.length - 1].targetDPO
  const industryBenchmark =
    dpoTrendData[dpoTrendData.length - 1].industryBenchmark
  const dpoVariance = currentDPO - targetDPO

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
      value: number
      dataKey: string
      color: string
      payload: Record<string, unknown>
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
          <p className="mb-2 font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>
                Actual DPO:{" "}
                <span className="font-semibold">{data.actualDPO} days</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>
                Target DPO:{" "}
                <span className="font-semibold">{data.targetDPO} days</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span>
                Industry Benchmark:{" "}
                <span className="font-semibold">
                  {data.industryBenchmark} days
                </span>
              </span>
            </div>
            {data.events && data.events.length > 0 && (
              <div className="border-border border-t pt-2">
                <div className="text-muted-foreground text-xs">Events:</div>
                {data.events.map((event: string, index: number) => (
                  <div key={index} className="text-muted-foreground text-xs">
                    • {event}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const handleDataPointClick = (data: DPOTrendData) => {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>DPO (Days Payable Outstanding) Trend Analysis</span>
          <div className="flex items-center space-x-2">
            {dpoVariance > 0 ? (
              <Badge variant="destructive" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />+{dpoVariance.toFixed(1)}{" "}
                days vs target
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs">
                <TrendingDown className="mr-1 h-3 w-3" />
                {dpoVariance.toFixed(1)} days vs target
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Monitor payables management efficiency and working capital
          optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Current DPO</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentDPO.toFixed(1)} days
              </div>
              <div className="text-sm text-blue-700">
                vs {industryBenchmark} days industry benchmark
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Target DPO</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {targetDPO.toFixed(1)} days
              </div>
              <div className="text-sm text-green-700">
                Strategic working capital target
              </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Industry Benchmark
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {industryBenchmark.toFixed(1)} days
              </div>
              <div className="text-sm text-orange-700">
                Industry average DPO
              </div>
            </div>
          </div>

          {/* DPO Trend Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dpoTrendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[25, 35]}
                  label={{ value: "Days", angle: -90, position: "insideLeft" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Target DPO Reference Line */}
                <ReferenceLine
                  y={targetDPO}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  label={{ value: "Target DPO", position: "topRight" }}
                />

                {/* Industry Benchmark Reference Line */}
                <ReferenceLine
                  y={industryBenchmark}
                  stroke="#f97316"
                  strokeDasharray="3 3"
                  label={{ value: "Industry Benchmark", position: "topLeft" }}
                />

                <Line
                  type="monotone"
                  dataKey="actualDPO"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                  name="Actual DPO"
                  onClick={handleDataPointClick}
                  style={{ cursor: "pointer" }}
                />
                <Line
                  type="monotone"
                  dataKey="targetDPO"
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                  name="Target DPO"
                />
                <Line
                  type="monotone"
                  dataKey="industryBenchmark"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
                  name="Industry Benchmark"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quarterly Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Quarterly DPO Analysis</h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Detailed Analysis
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>DPO Detailed Analysis</DialogTitle>
                    <DialogDescription>
                      Comprehensive breakdown of DPO performance and factors
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* DPO Formula */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h5 className="mb-2 font-semibold">DPO Calculation</h5>
                      <div className="font-mono text-sm">
                        DPO = (Average Accounts Payable / Cost of Goods Sold) ×
                        Number of Days in Period
                      </div>
                    </div>

                    {/* Quarterly Breakdown */}
                    <div className="space-y-2">
                      <h5 className="font-semibold">Quarterly Performance</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left">Quarter</th>
                              <th className="p-2 text-right">Actual DPO</th>
                              <th className="p-2 text-right">Target DPO</th>
                              <th className="p-2 text-right">Variance</th>
                              <th className="p-2 text-right">
                                Avg. Payment Terms
                              </th>
                              <th className="p-2 text-right">Total AP</th>
                              <th className="p-2 text-right">COGS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dpoTrendData.map((quarter, index) => (
                              <tr
                                key={index}
                                className="hover:bg-muted/50 border-b"
                              >
                                <td className="p-2 font-medium">
                                  {quarter.quarter}
                                </td>
                                <td className="p-2 text-right">
                                  {quarter.actualDPO.toFixed(1)}
                                </td>
                                <td className="p-2 text-right">
                                  {quarter.targetDPO.toFixed(1)}
                                </td>
                                <td
                                  className={`p-2 text-right font-semibold ${
                                    quarter.actualDPO > quarter.targetDPO
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {quarter.actualDPO > quarter.targetDPO
                                    ? "+"
                                    : ""}
                                  {(
                                    quarter.actualDPO - quarter.targetDPO
                                  ).toFixed(1)}
                                </td>
                                <td className="p-2 text-right">
                                  {quarter.avgPaymentTerms}
                                </td>
                                <td className="p-2 text-right">
                                  {formatCurrency(quarter.totalAP)}
                                </td>
                                <td className="p-2 text-right">
                                  {formatCurrency(quarter.cogs)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <h6 className="mb-2 font-semibold text-green-800">
                          Optimization Opportunities
                        </h6>
                        <ul className="space-y-1 text-sm text-green-700">
                          <li>• Extend payment terms with key suppliers</li>
                          <li>• Capture more early payment discounts</li>
                          <li>• Improve invoice processing efficiency</li>
                          <li>
                            • Negotiate better terms with strategic vendors
                          </li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h6 className="mb-2 font-semibold text-blue-800">
                          Risk Factors
                        </h6>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• Supplier relationship impact</li>
                          <li>• Cash flow management</li>
                          <li>• Working capital requirements</li>
                          <li>• Compliance with payment terms</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {dpoTrendData.slice(-3).map((quarter, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {quarter.quarter}
                    </span>
                    <Badge
                      variant={
                        quarter.actualDPO <= quarter.targetDPO
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {quarter.actualDPO.toFixed(1)} days
                    </Badge>
                  </div>
                  <div className="text-muted-foreground space-y-1 text-xs">
                    <div>Target: {quarter.targetDPO} days</div>
                    <div>
                      Variance:{" "}
                      {quarter.actualDPO > quarter.targetDPO ? "+" : ""}
                      {(quarter.actualDPO - quarter.targetDPO).toFixed(1)} days
                    </div>
                    <div>Avg Terms: {quarter.avgPaymentTerms} days</div>
                  </div>
                  {quarter.events && quarter.events.length > 0 && (
                    <div className="border-border mt-2 border-t pt-2">
                      <div className="text-muted-foreground text-xs">
                        Events:
                      </div>
                      {quarter.events.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="text-muted-foreground text-xs"
                        >
                          • {event}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
              <div>
                <span className="text-muted-foreground">Current DPO:</span>
                <span className="ml-2 font-semibold">
                  {currentDPO.toFixed(1)} days
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">vs Target:</span>
                <span
                  className={`ml-2 font-semibold ${dpoVariance > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {dpoVariance > 0 ? "+" : ""}
                  {dpoVariance.toFixed(1)} days
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">vs Industry:</span>
                <span
                  className={`ml-2 font-semibold ${currentDPO > industryBenchmark ? "text-green-600" : "text-red-600"}`}
                >
                  {currentDPO > industryBenchmark ? "+" : ""}
                  {(currentDPO - industryBenchmark).toFixed(1)} days
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Avg. Payment Terms:
                </span>
                <span className="ml-2 font-semibold">
                  {dpoTrendData[dpoTrendData.length - 1].avgPaymentTerms} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
