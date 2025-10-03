"use client"

import { useMemo } from "react"
import { ICustomer } from "@/interfaces/customer"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ReceivableAnalyticsProps {
  data: ICustomer[]
  isLoading?: boolean
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
]

export function ReceivableAnalytics({
  data,
  isLoading = false,
}: ReceivableAnalyticsProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Customer status distribution
    const statusDistribution = {
      Active: data.filter((customer) => customer.isActive).length,
      Inactive: data.filter((customer) => !customer.isActive).length,
    }

    // Credit limit distribution (simplified)
    const creditRanges = data.reduce(
      (acc, customer) => {
        const limit = customer.creditLimit || 0
        if (limit === 0) acc["No Limit"] = (acc["No Limit"] || 0) + 1
        else if (limit < 10000) acc["< $10K"] = (acc["< $10K"] || 0) + 1
        else if (limit < 50000)
          acc["$10K - $50K"] = (acc["$10K - $50K"] || 0) + 1
        else if (limit < 100000)
          acc["$50K - $100K"] = (acc["$50K - $100K"] || 0) + 1
        else acc["> $100K"] = (acc["> $100K"] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Aging analysis (mock data)
    const agingData = [
      {
        name: "Current",
        amount: Math.floor(data.length * 15000),
        color: "#00C49F",
      },
      {
        name: "1-30 Days",
        amount: Math.floor(data.length * 5000),
        color: "#FFBB28",
      },
      {
        name: "31-60 Days",
        amount: Math.floor(data.length * 3000),
        color: "#FF8042",
      },
      {
        name: "61-90 Days",
        amount: Math.floor(data.length * 2000),
        color: "#FF7C7C",
      },
      {
        name: "90+ Days",
        amount: Math.floor(data.length * 1000),
        color: "#FF0000",
      },
    ]

    // Monthly receivables trend (mock data)
    const monthlyTrend = [
      { month: "Jan", receivables: 120000, collections: 95000 },
      { month: "Feb", receivables: 135000, collections: 110000 },
      { month: "Mar", receivables: 150000, collections: 125000 },
      { month: "Apr", receivables: 165000, collections: 140000 },
      { month: "May", receivables: 180000, collections: 155000 },
      { month: "Jun", receivables: 195000, collections: 170000 },
    ]

    // Top customers by receivables (mock data)
    const topCustomers = data.slice(0, 10).map((customer, index) => ({
      name: customer.customerName,
      receivables: Math.floor(Math.random() * 50000 + 10000),
      rank: index + 1,
    }))

    return {
      statusDistribution: Object.entries(statusDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      creditRanges: Object.entries(creditRanges).map(([name, value]) => ({
        name,
        value,
      })),
      agingData,
      monthlyTrend,
      topCustomers,
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 animate-pulse rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="h-64 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>No Customer Data</CardTitle>
            <CardDescription>
              No customer data available for receivable analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Create some customers to see analytics here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Customer Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Status Distribution</CardTitle>
            <CardDescription>Active vs Inactive customers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#00C49F" : "#FF8042"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Limit Distribution</CardTitle>
            <CardDescription>
              Distribution of customer credit limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.creditRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Receivables Aging Analysis</CardTitle>
          <CardDescription>Distribution of receivables by age</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.agingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
              />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Receivables vs Collections Trend</CardTitle>
          <CardDescription>
            Monthly receivables and collections over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="receivables"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="collections"
                stackId="2"
                stroke="#82CA9D"
                fill="#82CA9D"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Receivables</CardTitle>
          <CardDescription>
            Customers with highest outstanding amounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `$${value.toLocaleString()}`,
                  "Receivables",
                ]}
              />
              <Legend />
              <Bar dataKey="receivables" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
