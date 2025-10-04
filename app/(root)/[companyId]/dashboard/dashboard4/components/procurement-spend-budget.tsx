"use client"

import { useState } from "react"
import {
  AlertTriangleIcon,
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProcurementSpendBudgetProps {
  period: string
  comparisonPeriod: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface DepartmentSpend {
  department: string
  actualSpend: number
  budget: number
  variance: number
  variancePercentage: number
  forecast: number
  category: string
  trend: number
}

export function ProcurementSpendBudget({
  period: _period,
  comparisonPeriod: _comparisonPeriod,
  businessUnits: _businessUnits,
  productLines: _productLines,
  geography: _geography,
}: ProcurementSpendBudgetProps) {
  const [viewMode, setViewMode] = useState<"variance" | "trend">("variance")
  const [_selectedCategory, _setSelectedCategory] = useState<string>("all")

  // Mock data - in real implementation, this would come from API
  const departmentSpend: DepartmentSpend[] = [
    {
      department: "Operations",
      actualSpend: 3200000,
      budget: 3000000,
      variance: 200000,
      variancePercentage: 6.7,
      forecast: 3500000,
      category: "Strategic",
      trend: 8.2,
    },
    {
      department: "Information Technology",
      actualSpend: 1800000,
      budget: 2200000,
      variance: -400000,
      variancePercentage: -18.2,
      forecast: 1900000,
      category: "Strategic",
      trend: -5.1,
    },
    {
      department: "Human Resources",
      actualSpend: 450000,
      budget: 500000,
      variance: -50000,
      variancePercentage: -10.0,
      forecast: 480000,
      category: "Tactical",
      trend: -2.3,
    },
    {
      department: "Finance",
      actualSpend: 280000,
      budget: 300000,
      variance: -20000,
      variancePercentage: -6.7,
      forecast: 290000,
      category: "Tactical",
      trend: -1.8,
    },
    {
      department: "Sales & Marketing",
      actualSpend: 1200000,
      budget: 1000000,
      variance: 200000,
      variancePercentage: 20.0,
      forecast: 1300000,
      category: "Strategic",
      trend: 15.6,
    },
    {
      department: "Procurement",
      actualSpend: 850000,
      budget: 800000,
      variance: 50000,
      variancePercentage: 6.3,
      forecast: 900000,
      category: "Tactical",
      trend: 12.4,
    },
    {
      department: "Legal & Compliance",
      actualSpend: 320000,
      budget: 350000,
      variance: -30000,
      variancePercentage: -8.6,
      forecast: 330000,
      category: "Strategic",
      trend: -4.2,
    },
  ]

  const totalActualSpend = departmentSpend.reduce(
    (sum, d) => sum + d.actualSpend,
    0
  )
  const totalBudget = departmentSpend.reduce((sum, d) => sum + d.budget, 0)
  const totalVariance = totalActualSpend - totalBudget
  const totalVariancePercentage = (totalVariance / totalBudget) * 100

  const chartData = departmentSpend.map((dept) => ({
    department: dept.department.split(" ")[0], // Shorten for chart
    actual: dept.actualSpend / 1000000, // Convert to millions
    budget: dept.budget / 1000000,
    variance: dept.variance / 1000000,
    variancePct: dept.variancePercentage,
    forecast: dept.forecast / 1000000,
  }))

  const monthlyTrend = [
    { month: "Jan", actual: 2.8, budget: 2.9, cumulative: 2.8 },
    { month: "Feb", actual: 2.9, budget: 2.9, cumulative: 5.7 },
    { month: "Mar", actual: 3.1, budget: 2.9, cumulative: 8.8 },
    { month: "Apr", actual: 2.7, budget: 2.9, cumulative: 11.5 },
    { month: "May", actual: 3.2, budget: 2.9, cumulative: 14.7 },
    { month: "Jun", actual: 3.4, budget: 2.9, cumulative: 18.1 },
  ]

  const getVarianceColor = (variance: number) => {
    if (variance > 0.05) return "text-red-600" // Over budget by >5%
    if (variance > 0) return "text-yellow-600" // Over budget by <5%
    return "text-green-600" // Under budget
  }

  const getVarianceBadgeColor = (variance: number) => {
    if (variance > 0.05) return "bg-red-100 text-red-800 border-red-200"
    if (variance > 0) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getCategoryColor = (category: string) => {
    return category === "Strategic"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-purple-100 text-purple-800 border-purple-200"
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
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground text-sm">
            Actual: ${data.actual.toFixed(1)}M
          </p>
          <p className="text-muted-foreground text-sm">
            Budget: ${data.budget.toFixed(1)}M
          </p>
          <p className="text-muted-foreground text-sm">
            Variance: ${data.variance.toFixed(1)}M (
            {data.variancePct.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSignIcon className="h-5 w-5" />
          Procurement Spend vs. Budget
          <Badge variant="outline" className="text-xs">
            Departmental Accountability
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(totalActualSpend / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">
              Total Actual Spend
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">Total Budget</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getVarianceColor(totalVariancePercentage)}`}
            >
              ${(totalVariance / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">Total Variance</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getVarianceColor(totalVariancePercentage)}`}
            >
              {totalVariancePercentage.toFixed(1)}%
            </div>
            <div className="text-muted-foreground text-xs">Variance %</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "variance" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("variance")}
            className="text-xs"
          >
            Variance Analysis
          </Button>
          <Button
            variant={viewMode === "trend" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("trend")}
            className="text-xs"
          >
            Trend Analysis
          </Button>
        </div>

        {/* Variance Chart */}
        {viewMode === "variance" && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Departmental Spend Variance</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trend Chart */}
        {viewMode === "trend" && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Monthly Spend Trend</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Actual Spend ($M)"
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Budget ($M)"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Cumulative ($M)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Department Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Department Details</h4>
          <div className="space-y-3">
            {departmentSpend.map((dept, _index) => (
              <Card key={dept.department} className="relative overflow-hidden">
                <CardContent className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h5 className="font-medium">{dept.department}</h5>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCategoryColor(dept.category)}`}
                          >
                            {dept.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {dept.trend > 0 ? (
                              <TrendingUpIcon className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDownIcon className="h-3 w-3 text-red-600" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                dept.trend > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Math.abs(dept.trend).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getVarianceBadgeColor(dept.variancePercentage / 100)}`}
                    >
                      {dept.variancePercentage > 0 ? "+" : ""}
                      {dept.variancePercentage.toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Actual
                      </div>
                      <div className="font-medium">
                        ${(dept.actualSpend / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Budget
                      </div>
                      <div className="font-medium">
                        ${(dept.budget / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Variance
                      </div>
                      <div
                        className={`font-medium ${getVarianceColor(dept.variancePercentage / 100)}`}
                      >
                        ${(dept.variance / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">
                        Forecast
                      </div>
                      <div className="font-medium">
                        ${(dept.forecast / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>Budget Utilization</span>
                      <span>
                        {((dept.actualSpend / dept.budget) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={(dept.actualSpend / dept.budget) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Over Budget Alerts
                </span>
              </div>
              <div className="space-y-1 text-xs text-red-700">
                <div>• Sales & Marketing: 20% over budget ($200K)</div>
                <div>• Operations: 6.7% over budget ($200K)</div>
                <div>• Procurement: 6.3% over budget ($50K)</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingDownIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Under Budget Opportunities
                </span>
              </div>
              <div className="space-y-1 text-xs text-green-700">
                <div>• IT: 18.2% under budget ($400K savings)</div>
                <div>• HR: 10% under budget ($50K savings)</div>
                <div>• Legal: 8.6% under budget ($30K savings)</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
