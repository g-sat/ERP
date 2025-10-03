"use client"

import { useState } from "react"
import {
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CustomerProfitabilityMatrixProps {
  period: string
  comparisonPeriod: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface CustomerData {
  id: string
  name: string
  revenue: number
  profitMargin: number
  outstandingAR: number
  tier: "Platinum" | "Gold" | "Silver" | "Bronze"
  quadrant: "Stars" | "Question Marks" | "Cash Cows" | "Dogs"
  trend: number
  riskRating: "Low" | "Medium" | "High"
}

export function CustomerProfitabilityMatrix({
  period,
  comparisonPeriod,
  businessUnits,
  productLines,
  geography,
}: CustomerProfitabilityMatrixProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>("all")
  const [selectedTier, setSelectedTier] = useState<string>("all")

  // Mock data - in real implementation, this would come from API
  const customerData: CustomerData[] = [
    {
      id: "1",
      name: "Acme Corporation",
      revenue: 2500000,
      profitMargin: 22.5,
      outstandingAR: 450000,
      tier: "Platinum",
      quadrant: "Stars",
      trend: 15.2,
      riskRating: "Low",
    },
    {
      id: "2",
      name: "TechStart Inc",
      revenue: 1800000,
      profitMargin: 28.3,
      outstandingAR: 320000,
      tier: "Platinum",
      quadrant: "Stars",
      trend: 22.1,
      riskRating: "Low",
    },
    {
      id: "3",
      name: "Global Manufacturing",
      revenue: 3200000,
      profitMargin: 12.8,
      outstandingAR: 680000,
      tier: "Gold",
      quadrant: "Cash Cows",
      trend: 8.5,
      riskRating: "Medium",
    },
    {
      id: "4",
      name: "Innovation Labs",
      revenue: 450000,
      profitMargin: 35.2,
      outstandingAR: 85000,
      tier: "Silver",
      quadrant: "Question Marks",
      trend: 45.6,
      riskRating: "Low",
    },
    {
      id: "5",
      name: "Legacy Systems Co",
      revenue: 1200000,
      profitMargin: 8.9,
      outstandingAR: 280000,
      tier: "Bronze",
      quadrant: "Dogs",
      trend: -5.2,
      riskRating: "High",
    },
    {
      id: "6",
      name: "Future Enterprises",
      revenue: 750000,
      profitMargin: 31.7,
      outstandingAR: 120000,
      tier: "Silver",
      quadrant: "Question Marks",
      trend: 18.9,
      riskRating: "Low",
    },
    {
      id: "7",
      name: "MegaCorp International",
      revenue: 4200000,
      profitMargin: 15.4,
      outstandingAR: 750000,
      tier: "Gold",
      quadrant: "Cash Cows",
      trend: 3.2,
      riskRating: "Medium",
    },
    {
      id: "8",
      name: "Startup Ventures",
      revenue: 280000,
      profitMargin: 42.1,
      outstandingAR: 45000,
      tier: "Silver",
      quadrant: "Question Marks",
      trend: 67.3,
      riskRating: "Medium",
    },
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "#9333ea"
      case "Gold":
        return "#f59e0b"
      case "Silver":
        return "#6b7280"
      case "Bronze":
        return "#cd7f32"
      default:
        return "#6b7280"
    }
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "Stars":
        return "bg-green-50 border-green-200"
      case "Question Marks":
        return "bg-blue-50 border-blue-200"
      case "Cash Cows":
        return "bg-yellow-50 border-yellow-200"
      case "Dogs":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredData = customerData.filter((customer) => {
    if (selectedQuadrant !== "all" && customer.quadrant !== selectedQuadrant) {
      return false
    }
    if (selectedTier !== "all" && customer.tier !== selectedTier) {
      return false
    }
    return true
  })

  const scatterData = filteredData.map((customer) => ({
    ...customer,
    revenueLog: Math.log10(customer.revenue),
    bubbleSize: Math.max(20, Math.min(80, customer.outstandingAR / 10000)),
  }))

  const quadrantStats = {
    Stars: customerData.filter((c) => c.quadrant === "Stars").length,
    "Question Marks": customerData.filter(
      (c) => c.quadrant === "Question Marks"
    ).length,
    "Cash Cows": customerData.filter((c) => c.quadrant === "Cash Cows").length,
    Dogs: customerData.filter((c) => c.quadrant === "Dogs").length,
  }

  const totalRevenue = customerData.reduce((sum, c) => sum + c.revenue, 0)
  const totalOutstandingAR = customerData.reduce(
    (sum, c) => sum + c.outstandingAR,
    0
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground text-sm">
            Revenue: ${data.revenue.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm">
            Profit Margin: {data.profitMargin}%
          </p>
          <p className="text-muted-foreground text-sm">
            Outstanding AR: ${data.outstandingAR.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm">Tier: {data.tier}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Customer Profitability Matrix
          <Badge variant="outline" className="text-xs">
            Strategic Account Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(totalOutstandingAR / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">Outstanding AR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{customerData.length}</div>
            <div className="text-muted-foreground text-xs">
              Active Customers
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">18.2%</div>
            <div className="text-muted-foreground text-xs">
              Avg Profit Margin
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedQuadrant === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedQuadrant("all")}
            className="text-xs"
          >
            All ({customerData.length})
          </Button>
          {Object.entries(quadrantStats).map(([quadrant, count]) => (
            <Button
              key={quadrant}
              variant={selectedQuadrant === quadrant ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedQuadrant(quadrant)}
              className="text-xs"
            >
              {quadrant} ({count})
            </Button>
          ))}
        </div>

        {/* Bubble Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              data={scatterData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="revenueLog"
                name="Revenue (Log Scale)"
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
                tickFormatter={(value) =>
                  `$${Math.pow(10, value).toLocaleString()}`
                }
              />
              <YAxis
                type="number"
                dataKey="profitMargin"
                name="Profit Margin %"
                domain={[0, 50]}
                label={{
                  value: "Profit Margin (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine x={6} stroke="#ef4444" strokeDasharray="5 5" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="profitMargin" fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTierColor(entry.tier)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Quadrant Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-green-200 bg-green-50 p-2">
            <div className="font-medium text-green-800">Stars (Top-Right)</div>
            <div className="text-green-600">High Revenue, High Margin</div>
          </div>
          <div className="rounded border border-blue-200 bg-blue-50 p-2">
            <div className="font-medium text-blue-800">
              Question Marks (Top-Left)
            </div>
            <div className="text-blue-600">Low Revenue, High Margin</div>
          </div>
          <div className="rounded border border-yellow-200 bg-yellow-50 p-2">
            <div className="font-medium text-yellow-800">
              Cash Cows (Bottom-Right)
            </div>
            <div className="text-yellow-600">High Revenue, Low Margin</div>
          </div>
          <div className="rounded border border-red-200 bg-red-50 p-2">
            <div className="font-medium text-red-800">Dogs (Bottom-Left)</div>
            <div className="text-red-600">Low Revenue, Low Margin</div>
          </div>
        </div>

        {/* Customer List */}
        <Tabs defaultValue="stars" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stars">Stars</TabsTrigger>
            <TabsTrigger value="question-marks">Question Marks</TabsTrigger>
            <TabsTrigger value="cash-cows">Cash Cows</TabsTrigger>
            <TabsTrigger value="dogs">Dogs</TabsTrigger>
          </TabsList>

          <TabsContent value="stars">
            <div className="space-y-2">
              {customerData
                .filter((c) => c.quadrant === "Stars")
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {customer.tier}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRiskColor(customer.riskRating)}`}
                        >
                          {customer.riskRating} Risk
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        ${customer.revenue.toLocaleString()} •{" "}
                        {customer.profitMargin}% margin • $
                        {customer.outstandingAR.toLocaleString()} AR
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.trend > 0 ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(customer.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="question-marks">
            <div className="space-y-2">
              {customerData
                .filter((c) => c.quadrant === "Question Marks")
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {customer.tier}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRiskColor(customer.riskRating)}`}
                        >
                          {customer.riskRating} Risk
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        ${customer.revenue.toLocaleString()} •{" "}
                        {customer.profitMargin}% margin • $
                        {customer.outstandingAR.toLocaleString()} AR
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.trend > 0 ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(customer.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="cash-cows">
            <div className="space-y-2">
              {customerData
                .filter((c) => c.quadrant === "Cash Cows")
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {customer.tier}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRiskColor(customer.riskRating)}`}
                        >
                          {customer.riskRating} Risk
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        ${customer.revenue.toLocaleString()} •{" "}
                        {customer.profitMargin}% margin • $
                        {customer.outstandingAR.toLocaleString()} AR
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.trend > 0 ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(customer.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="dogs">
            <div className="space-y-2">
              {customerData
                .filter((c) => c.quadrant === "Dogs")
                .map((customer) => (
                  <div
                    key={customer.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {customer.tier}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRiskColor(customer.riskRating)}`}
                        >
                          {customer.riskRating} Risk
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        ${customer.revenue.toLocaleString()} •{" "}
                        {customer.profitMargin}% margin • $
                        {customer.outstandingAR.toLocaleString()} AR
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.trend > 0 ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(customer.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
