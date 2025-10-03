"use client"

import { useMemo } from "react"
import { IChartofAccount } from "@/interfaces/chartofaccount"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

interface AccountAnalyticsProps {
  data: IChartofAccount[]
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

export function AccountAnalytics({
  data,
  isLoading = false,
}: AccountAnalyticsProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    if (!data || data.length === 0)
      return {
        accountTypes: [],
        accountGroups: [],
        activeInactive: [],
        systemUser: [],
        monthlyTrend: [],
      }

    // Account type distribution
    const accountTypes = data.reduce(
      (acc, account) => {
        const type = account.accTypeName || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Account group distribution
    const accountGroups = data.reduce(
      (acc, account) => {
        const group = account.accGroupName || "Unknown"
        acc[group] = (acc[group] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Active vs Inactive
    const activeInactive = {
      Active: data.filter((account) => account.isActive).length,
      Inactive: data.filter((account) => !account.isActive).length,
    }

    // System vs User accounts
    const systemUser = {
      System: data.filter((account) => account.isSysControl).length,
      User: data.filter((account) => !account.isSysControl).length,
    }

    // Monthly creation trend (simplified)
    const monthlyTrend = data.reduce(
      (acc, account) => {
        const date = new Date(account.createDate)
        const month = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      accountTypes: Object.entries(accountTypes).map(([name, value]) => ({
        name,
        value,
      })),
      accountGroups: Object.entries(accountGroups).map(([name, value]) => ({
        name,
        value,
      })),
      activeInactive: Object.entries(activeInactive).map(([name, value]) => ({
        name,
        value,
      })),
      systemUser: Object.entries(systemUser).map(([name, value]) => ({
        name,
        value,
      })),
      monthlyTrend: Object.entries(monthlyTrend)
        .map(([name, value]) => ({ name, value }))
        .sort(
          (a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()
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
            <CardTitle>No Account Data</CardTitle>
            <CardDescription>
              No chart of accounts data available for analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Create some accounts to see analytics here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Type Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Type Distribution</CardTitle>
            <CardDescription>Breakdown of accounts by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.accountTypes}
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
                  {chartData.accountTypes.map(
                    (entry: { name: string; value: number }, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Group Distribution</CardTitle>
            <CardDescription>Breakdown of accounts by group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.accountGroups}>
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

      {/* Active vs Inactive */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active vs Inactive Accounts</CardTitle>
            <CardDescription>Distribution of account status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.activeInactive}
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
                  {chartData.activeInactive.map(
                    (entry: { name: string; value: number }, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#00C49F" : "#FF8042"}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System vs User Accounts</CardTitle>
            <CardDescription>Distribution of account control</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.systemUser}>
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
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Account Creation Trend</CardTitle>
          <CardDescription>Monthly account creation over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
