"use client"

import { useMemo } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import {
  Activity,
  AlertTriangle,
  Clock,
  MapPin,
  Ship,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ChecklistAnalyticsFallback } from "./checklist-analytics-fallback"

interface ChecklistAnalyticsProps {
  data: IJobOrderHd[]
  isLoading?: boolean
}

export function ChecklistAnalytics({
  data,
  isLoading = false,
}: ChecklistAnalyticsProps) {
  // If no data or error, show fallback
  if (!data || data.length === 0) {
    return (
      <ChecklistAnalyticsFallback data={data || []} isLoading={isLoading} />
    )
  }
  // Process data for charts
  const chartData = useMemo(() => {
    const statusCounts = data.reduce(
      (acc, job) => {
        const status = job.statusName || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: data.length > 0 ? (count / data.length) * 100 : 0,
    }))
  }, [data])

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const monthlyData = data.reduce(
      (acc, job) => {
        if (job.jobOrderDate) {
          const date = new Date(job.jobOrderDate)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

          if (!acc[monthKey]) {
            acc[monthKey] = {
              month: monthKey,
              total: 0,
              completed: 0,
              pending: 0,
            }
          }

          acc[monthKey].total += 1
          if (job.statusName === "Completed") acc[monthKey].completed += 1
          if (job.statusName === "Pending") acc[monthKey].pending += 1
        }
        return acc
      },
      {} as Record<
        string,
        { month: string; total: number; completed: number; pending: number }
      >
    )

    return Object.values(monthlyData).sort(
      (a: { month: string }, b: { month: string }) =>
        a.month.localeCompare(b.month)
    )
  }, [data])

  // Port distribution
  const portDistribution = useMemo(() => {
    const portCounts = data.reduce(
      (acc, job) => {
        const port = job.portName || "Unknown"
        acc[port] = (acc[port] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(portCounts)
      .map(([port, count]) => ({ port, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 ports
  }, [data])

  // Customer distribution
  const customerDistribution = useMemo(() => {
    const customerCounts = data.reduce(
      (acc, job) => {
        const customer = job.customerName || "Unknown"
        acc[customer] = (acc[customer] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(customerCounts)
      .map(([customer, count]) => ({ customer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 customers
  }, [data])

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const total = data.length
    const completed = data.filter(
      (job) => job.statusName === "Completed"
    ).length
    const pending = data.filter((job) => job.statusName === "Pending").length
    const cancelled = data.filter(
      (job) => job.statusName === "Cancelled"
    ).length

    const completionRate = total > 0 ? (completed / total) * 100 : 0
    const pendingRate = total > 0 ? (pending / total) * 100 : 0
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0

    return {
      total,
      completed,
      pending,
      cancelled,
      completionRate,
      pendingRate,
      cancellationRate,
    }
  }, [data])

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 animate-pulse rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-8 animate-pulse rounded bg-gray-200" />
                <div className="h-3 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.total}</div>
            <p className="text-muted-foreground text-xs">All time jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.completionRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {performanceMetrics.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.pending}
            </div>
            <p className="text-muted-foreground text-xs">
              {performanceMetrics.pendingRate.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancellation Rate
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.cancellationRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {performanceMetrics.cancelled} cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>Breakdown of jobs by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) =>
                    `${status} (${percentage.toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Job Trends</CardTitle>
            <CardDescription>
              Job creation and completion over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Ports and Customers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Ports */}
        <Card>
          <CardHeader>
            <CardTitle>Top Ports</CardTitle>
            <CardDescription>Most active ports by job count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portDistribution.map(({ port, count }, index) => (
                <div key={port} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{port}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{count}</Badge>
                    <span className="text-muted-foreground text-xs">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Most active customers by job count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerDistribution.map(({ customer, count }, index) => (
                <div
                  key={customer}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Ship className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">{customer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{count}</Badge>
                    <span className="text-muted-foreground text-xs">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution (Bar Chart)</CardTitle>
          <CardDescription>Visual breakdown of job statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
