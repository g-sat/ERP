"use client"

import { useMemo } from "react"
import { ISupplier } from "@/interfaces/supplier"
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

interface PayableAnalyticsProps {
  data: ISupplier[]
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

export function PayableAnalytics({
  data,
  isLoading = false,
}: PayableAnalyticsProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Supplier status distribution
    const statusDistribution = {
      Active: data.filter((supplier) => supplier.isActive).length,
      Inactive: data.filter((supplier) => !supplier.isActive).length,
    }

    // Payment terms distribution (mock data)
    const paymentTerms = {
      "Net 15": Math.floor(data.length * 0.25),
      "Net 30": Math.floor(data.length * 0.6),
      "Net 45": Math.floor(data.length * 0.15),
    }

    // Aging analysis (mock data)
    const agingData = [
      {
        name: "Current",
        amount: Math.floor(data.length * 12000),
        color: "#00C49F",
      },
      {
        name: "1-30 Days",
        amount: Math.floor(data.length * 8000),
        color: "#FFBB28",
      },
      {
        name: "31-60 Days",
        amount: Math.floor(data.length * 5000),
        color: "#FF8042",
      },
      {
        name: "61-90 Days",
        amount: Math.floor(data.length * 3000),
        color: "#FF7C7C",
      },
      {
        name: "90+ Days",
        amount: Math.floor(data.length * 1000),
        color: "#FF0000",
      },
    ]

    // Monthly payables trend (mock data)
    const monthlyTrend = [
      { month: "Jan", payables: 100000, payments: 85000 },
      { month: "Feb", payables: 115000, payments: 95000 },
      { month: "Mar", payables: 130000, payments: 110000 },
      { month: "Apr", payables: 145000, payments: 125000 },
      { month: "May", payables: 160000, payments: 140000 },
      { month: "Jun", payables: 175000, payments: 155000 },
    ]

    // Top suppliers by payables (mock data)
    const topSuppliers = data.slice(0, 10).map((supplier, index) => ({
      name: supplier.supplierName,
      payables: Math.floor(Math.random() * 40000 + 8000),
      rank: index + 1,
    }))

    // Payment method distribution (mock data)
    const paymentMethods = {
      "Bank Transfer": Math.floor(data.length * 0.4),
      Check: Math.floor(data.length * 0.3),
      "Credit Card": Math.floor(data.length * 0.2),
      Cash: Math.floor(data.length * 0.1),
    }

    return {
      statusDistribution: Object.entries(statusDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      paymentTerms: Object.entries(paymentTerms).map(([name, value]) => ({
        name,
        value,
      })),
      agingData,
      monthlyTrend,
      topSuppliers,
      paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({
        name,
        value,
      })),
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
            <CardTitle>No Supplier Data</CardTitle>
            <CardDescription>
              No supplier data available for payable analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Create some suppliers to see analytics here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Supplier Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Status Distribution</CardTitle>
            <CardDescription>Active vs Inactive suppliers</CardDescription>
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
            <CardTitle>Payment Terms Distribution</CardTitle>
            <CardDescription>
              Distribution of supplier payment terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.paymentTerms}>
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
          <CardTitle>Payables Aging Analysis</CardTitle>
          <CardDescription>Distribution of payables by age</CardDescription>
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
          <CardTitle>Payables vs Payments Trend</CardTitle>
          <CardDescription>
            Monthly payables and payments over time
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
                dataKey="payables"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="payments"
                stackId="2"
                stroke="#82CA9D"
                fill="#82CA9D"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Suppliers and Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers by Payables</CardTitle>
            <CardDescription>
              Suppliers with highest outstanding amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topSuppliers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    "Payables",
                  ]}
                />
                <Legend />
                <Bar dataKey="payables" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
            <CardDescription>
              Distribution of payment methods used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.paymentMethods}
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
                  {chartData.paymentMethods.map((entry, index) => (
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
      </div>
    </div>
  )
}
