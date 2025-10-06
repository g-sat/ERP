"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Building2,
  RefreshCw,
  Wifi,
  WifiOff,
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

interface BankBalancesAlertsProps {
  period: string
  entities: string[]
}

interface BankAccount {
  accountId: string
  bankName: string
  accountNickname: string
  currentBalance: number
  alertThreshold: number
  lastUpdated: string
  isConnected: boolean
  currency: string
  accountType: "operating" | "savings" | "investment" | "petty-cash"
}

export function BankBalancesAlerts({
  period,
  entities,
}: BankBalancesAlertsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Mock data - in real implementation, this would come from API
  const mockData: BankAccount[] = useMemo(() => {
    const banks = [
      {
        name: "JPMorgan Chase",
        nickname: "Operating",
        type: "operating" as const,
      },
      {
        name: "Bank of America",
        nickname: "Savings",
        type: "savings" as const,
      },
      {
        name: "Wells Fargo",
        nickname: "Investment",
        type: "investment" as const,
      },
      {
        name: "Local Credit Union",
        nickname: "Petty Cash",
        type: "petty-cash" as const,
      },
    ]

    return banks.map((bank, index) => {
      const baseBalance = 500000 + index * 200000 + Math.random() * 300000
      const alertThreshold = baseBalance * 0.1 // 10% of balance as threshold
      const isLowBalance = baseBalance < alertThreshold * 2 // Simulate some low balance accounts
      const isConnected = Math.random() > 0.1 // 90% connection rate

      return {
        accountId: `bank-${index + 1}`,
        bankName: bank.name,
        accountNickname: bank.nickname,
        currentBalance: isLowBalance ? alertThreshold * 1.5 : baseBalance,
        alertThreshold,
        lastUpdated: new Date(
          Date.now() - Math.random() * 300000
        ).toISOString(), // Last 5 minutes
        isConnected,
        currency: "USD",
        accountType: bank.type,
      }
    })
  }, [period, entities])

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const updated = new Date(timestamp)
    const diffInMinutes = Math.floor(
      (now.getTime() - updated.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`
    return `${Math.floor(diffInMinutes / 1440)} day ago`
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "operating":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "savings":
        return "bg-green-100 text-green-800 border-green-200"
      case "investment":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "petty-cash":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  const totalBalance = mockData.reduce(
    (sum, account) => sum + account.currentBalance,
    0
  )
  const lowBalanceAccounts = mockData.filter(
    (account) => account.currentBalance < account.alertThreshold * 2
  )
  const disconnectedAccounts = mockData.filter(
    (account) => !account.isConnected
  )

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Balances & Alerts
              {lowBalanceAccounts.length > 0 && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              Real-time corporate liquidity across all bank accounts
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Total Balance
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totalBalance)}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Alert Status
            </div>
            <div className="text-xl font-bold text-red-600">
              {lowBalanceAccounts.length} Alert
              {lowBalanceAccounts.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Bank Account Cards */}
        <div className="space-y-3">
          {mockData.map((account) => {
            const isLowBalance =
              account.currentBalance < account.alertThreshold * 2
            const isAlert = account.currentBalance < account.alertThreshold

            return (
              <div
                key={account.accountId}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-sm ${
                  isAlert
                    ? "animate-pulse border-red-300 bg-red-50"
                    : isLowBalance
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200 bg-white"
                }`}
                onClick={() => {
                  // Navigate to Bank Reconciliation module for this account
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {account.bankName} - {account.accountNickname}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getAccountTypeColor(account.accountType)}`}
                      >
                        {account.accountType}
                      </Badge>
                      {isAlert && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Low Balance
                        </Badge>
                      )}
                      {!account.isConnected && (
                        <Badge variant="secondary" className="text-xs">
                          <WifiOff className="mr-1 h-3 w-3" />
                          Disconnected
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">
                          {formatCurrency(
                            account.currentBalance,
                            account.currency
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Updated {getTimeAgo(account.lastUpdated)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {account.isConnected ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isAlert && (
                  <div className="mt-2 rounded border border-red-200 bg-red-100 p-2 text-xs text-red-700">
                    ⚠️ Balance is below alert threshold of{" "}
                    {formatCurrency(account.alertThreshold, account.currency)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Connection Status Summary */}
        {disconnectedAccounts.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                {disconnectedAccounts.length} account
                {disconnectedAccounts.length !== 1 ? "s" : ""} disconnected
              </span>
            </div>
            <div className="mt-1 text-xs text-yellow-700">
              Some accounts may show cached data. Click refresh to retry
              connection.
            </div>
          </div>
        )}

        {/* Drill-down Action */}
        <div className="border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              // Navigate to Bank Management module
            }}
          >
            Manage Bank Accounts →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
