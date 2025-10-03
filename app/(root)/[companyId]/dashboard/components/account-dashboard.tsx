"use client"

import { useMemo, useState } from "react"
import { IChartofAccount } from "@/interfaces/chartofaccount"
import { useAuthStore } from "@/stores/auth-store"
import { Activity, BarChart3, Building2, Calculator, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// import { AccountAnalytics } from "./account-analytics"
// import { AccountSummary } from "./account-summary"

interface AccountDashboardProps {
  data: IChartofAccount[]
  isLoading?: boolean
}

export function AccountDashboard({
  data,
  isLoading = false,
}: AccountDashboardProps) {
  const { user } = useAuthStore()

  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedView, setSelectedView] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoized metrics calculation
  const metrics = useMemo(() => {
    const totalAccounts = data.length
    const activeAccounts = data.filter((account) => account.isActive).length
    const inactiveAccounts = data.filter((account) => !account.isActive).length
    const systemAccounts = data.filter((account) => account.isSysControl).length
    const userAccounts = data.filter((account) => !account.isSysControl).length

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

    return {
      totalAccounts,
      activeAccounts,
      inactiveAccounts,
      systemAccounts,
      userAccounts,
      accountTypes,
      accountGroups,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Account Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.userName}. Here&apos;s your account overview.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-[150px] lg:w-[250px]"
          />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Accounts
            </CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAccounts}</div>
            <p className="text-muted-foreground text-xs">
              All chart of accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Accounts
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeAccounts}</div>
            <p className="text-muted-foreground text-xs">
              {metrics.totalAccounts > 0
                ? (
                    (metrics.activeAccounts / metrics.totalAccounts) *
                    100
                  ).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Accounts
            </CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemAccounts}</div>
            <p className="text-muted-foreground text-xs">System controlled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userAccounts}</div>
            <p className="text-muted-foreground text-xs">User managed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Account Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Account Type Distribution</CardTitle>
                <CardDescription>Breakdown of accounts by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.accountTypes).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${(count / metrics.totalAccounts) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Group Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Account Group Distribution</CardTitle>
                <CardDescription>
                  Breakdown of accounts by group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.accountGroups).map(
                    ([group, count]) => (
                      <div
                        key={group}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{group}</span>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-20 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{
                                width: `${(count / metrics.totalAccounts) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Accounts</CardTitle>
              <CardDescription>
                Latest chart of accounts created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.slice(0, 5).map((account, index) => (
                  <div
                    key={account.glId}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{account.glCode}</p>
                        <p className="text-muted-foreground text-xs">
                          {account.glName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={account.isActive ? "default" : "secondary"}
                      >
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        variant={
                          account.isSysControl ? "destructive" : "outline"
                        }
                      >
                        {account.isSysControl ? "System" : "User"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Account Summary coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Account Analytics coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Reports</CardTitle>
              <CardDescription>
                Generate and export detailed account reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Reporting features coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
