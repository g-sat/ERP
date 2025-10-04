"use client"

import { useMemo, useState } from "react"
import { IBank } from "@/interfaces/bank"
import { useAuthStore } from "@/stores/auth-store"
import {
  Activity,
  BarChart3,
  Building2,
  Calculator,
  CreditCard,
  DollarSign,
  Download,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

import { BankAnalytics } from "./bank-analytics"
import { BankSummary } from "./bank-summary"

interface BankDashboardProps {
  data: IBank[]
  isLoading?: boolean
}

export function BankDashboard({ data, isLoading = false }: BankDashboardProps) {
  const { user } = useAuthStore()

  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedView, setSelectedView] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoized metrics calculation
  const metrics = useMemo(() => {
    const totalBanks = data.length
    const activeBanks = data.filter((bank) => bank.isActive).length
    const inactiveBanks = data.filter((bank) => !bank.isActive).length
    const ownBanks = data.filter((bank) => bank.isOwnBank).length
    const pettyCashBanks = data.filter((bank) => bank.isPettyCashBank).length

    // Calculate balances (simplified - would need actual balance data)
    const totalBalance = Math.floor(totalBanks * 250000) // Mock data
    const totalDeposits = Math.floor(totalBanks * 180000)
    const totalWithdrawals = Math.floor(totalBanks * 120000)
    const netCashFlow = totalDeposits - totalWithdrawals

    // Currency distribution
    const currencyDistribution = data.reduce(
      (acc, bank) => {
        const currency = bank.currencyCode || "Unknown"
        acc[currency] = (acc[currency] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalBanks,
      activeBanks,
      inactiveBanks,
      ownBanks,
      pettyCashBanks,
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      netCashFlow,
      currencyDistribution,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bank Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.userName}. Here&apos;s your banking overview.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search banks..."
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
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalBalance.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banks</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeBanks}</div>
            <p className="text-muted-foreground text-xs">
              {metrics.totalBanks > 0
                ? ((metrics.activeBanks / metrics.totalBanks) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${metrics.netCashFlow.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Own Banks</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ownBanks}</div>
            <p className="text-muted-foreground text-xs">Company owned</p>
          </CardContent>
        </Card>
      </div>

      {/* Banking Activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deposits
            </CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalDeposits.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Withdrawals
            </CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalWithdrawals.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Petty Cash Banks
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pettyCashBanks}</div>
            <p className="text-muted-foreground text-xs">For small expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Currency Types
            </CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(metrics.currencyDistribution).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Different currencies
            </p>
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
            {/* Bank Accounts List */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>
                  All bank accounts and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 5).map((bank, index) => (
                    <div
                      key={bank.bankId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{bank.bankName}</p>
                          <p className="text-muted-foreground text-xs">
                            {bank.bankCode} • {bank.currencyCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          ${(Math.random() * 100000 + 10000).toLocaleString()}
                        </span>
                        <div className="flex space-x-1">
                          <Badge
                            variant={bank.isActive ? "default" : "secondary"}
                          >
                            {bank.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {bank.isOwnBank && (
                            <Badge variant="outline">Own</Badge>
                          )}
                          {bank.isPettyCashBank && (
                            <Badge variant="destructive">Petty</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest banking activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.slice(0, 3).map((bank, _index) => (
                    <div
                      key={bank.bankId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                          <span className="text-sm font-medium">+</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Deposit to {bank.bankName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-600">
                          +${(Math.random() * 5000 + 1000).toLocaleString()}
                        </span>
                        <p className="text-muted-foreground text-xs">Deposit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <BankSummary
            totalBanks={metrics.totalBanks}
            activeBanks={metrics.activeBanks}
            totalBalance={metrics.totalBalance}
            totalDeposits={metrics.totalDeposits}
            totalWithdrawals={metrics.totalWithdrawals}
            netCashFlow={metrics.netCashFlow}
            currencyDistribution={metrics.currencyDistribution}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BankAnalytics data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reports</CardTitle>
              <CardDescription>
                Generate and export detailed banking reports
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
