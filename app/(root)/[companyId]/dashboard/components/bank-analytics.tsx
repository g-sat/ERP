"use client"

import { useMemo } from "react"
import { IBank } from "@/interfaces/bank"
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

interface BankAnalyticsProps {
  data: IBank[]
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

export function BankAnalytics({ data, isLoading = false }: BankAnalyticsProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Bank status distribution
    const statusDistribution = {
      Active: data.filter((bank) => bank.isActive).length,
      Inactive: data.filter((bank) => !bank.isActive).length,
    }

    // Currency distribution
    const currencyDistribution = data.reduce(
      (acc, bank) => {
        const currency = bank.currencyCode || "Unknown"
        acc[currency] = (acc[currency] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Bank type distribution
    const bankTypeDistribution = {
      "Own Banks": data.filter((bank) => bank.isOwnBank).length,
      "External Banks": data.filter((bank) => !bank.isOwnBank).length,
      "Petty Cash": data.filter((bank) => bank.isPettyCashBank).length,
    }

    // Monthly balance trend (mock data)
    const monthlyTrend = [
      { month: "Jan", balance: 200000, deposits: 150000, withdrawals: 100000 },
      { month: "Feb", balance: 220000, deposits: 160000, withdrawals: 110000 },
      { month: "Mar", balance: 240000, deposits: 170000, withdrawals: 120000 },
      { month: "Apr", balance: 260000, deposits: 180000, withdrawals: 130000 },
      { month: "May", balance: 280000, deposits: 190000, withdrawals: 140000 },
      { month: "Jun", balance: 300000, deposits: 200000, withdrawals: 150000 },
    ]

    // Top banks by balance (mock data)
    const topBanks = data.slice(0, 10).map((bank, index) => ({
      name: bank.bankName,
      balance: Math.floor(Math.random() * 200000 + 50000),
      rank: index + 1,
    }))

    // Transaction types (mock data)
    const transactionTypes = {
      Deposits: Math.floor(data.length * 0.4),
      Withdrawals: Math.floor(data.length * 0.3),
      Transfers: Math.floor(data.length * 0.2),
      Fees: Math.floor(data.length * 0.1),
    }

    return {
      statusDistribution: Object.entries(statusDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      currencyDistribution: Object.entries(currencyDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      bankTypeDistribution: Object.entries(bankTypeDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
      monthlyTrend,
      topBanks,
      transactionTypes: Object.entries(transactionTypes).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),
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
            <CardTitle>No Bank Data</CardTitle>
            <CardDescription>
              No bank data available for analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Create some banks to see analytics here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bank Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bank Status Distribution</CardTitle>
            <CardDescription>Active vs Inactive banks</CardDescription>
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
            <CardTitle>Currency Distribution</CardTitle>
            <CardDescription>Distribution of banks by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.currencyDistribution}>
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

      {/* Bank Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Type Distribution</CardTitle>
          <CardDescription>Distribution of banks by type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.bankTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82CA9D" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Balance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Balance Trend</CardTitle>
          <CardDescription>
            Bank balances and transaction activity over time
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
                dataKey="balance"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                stackId="2"
                stroke="#82CA9D"
                fill="#82CA9D"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stackId="3"
                stroke="#FF7C7C"
                fill="#FF7C7C"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Banks and Transaction Types */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Banks by Balance</CardTitle>
            <CardDescription>Banks with highest balances</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topBanks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    "Balance",
                  ]}
                />
                <Legend />
                <Bar dataKey="balance" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Types Distribution</CardTitle>
            <CardDescription>Distribution of transaction types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.transactionTypes}
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
                  {chartData.transactionTypes.map((entry, index) => (
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
