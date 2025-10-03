"use client"

import {
  Activity,
  Building2,
  Calculator,
  CheckCircle,
  Users,
  XCircle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AccountSummaryProps {
  totalAccounts: number
  activeAccounts: number
  inactiveAccounts: number
  systemAccounts: number
  userAccounts: number
  accountTypes: Record<string, number>
  accountGroups: Record<string, number>
}

export function AccountSummary({
  totalAccounts,
  activeAccounts,
  inactiveAccounts,
  systemAccounts,
  userAccounts,
  accountTypes,
  accountGroups,
}: AccountSummaryProps) {
  const activePercentage =
    totalAccounts > 0 ? (activeAccounts / totalAccounts) * 100 : 0
  const systemPercentage =
    totalAccounts > 0 ? (systemAccounts / totalAccounts) * 100 : 0

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-muted-foreground text-xs">
              All chart of accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePercentage.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {activeAccounts} of {totalAccounts} accounts
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
            <div className="text-2xl font-bold">{systemAccounts}</div>
            <p className="text-muted-foreground text-xs">
              {systemPercentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAccounts}</div>
            <p className="text-muted-foreground text-xs">
              {(100 - systemPercentage).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Status Distribution</CardTitle>
            <CardDescription>
              Active vs Inactive accounts breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {activeAccounts} accounts
                </span>
              </div>
              <Progress value={activePercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {inactiveAccounts} accounts
                </span>
              </div>
              <Progress value={100 - activePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Control Distribution</CardTitle>
            <CardDescription>
              System vs User controlled accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">System</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {systemAccounts} accounts
                </span>
              </div>
              <Progress value={systemPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">User</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {userAccounts} accounts
                </span>
              </div>
              <Progress value={100 - systemPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Account Types Breakdown</CardTitle>
          <CardDescription>Distribution of accounts by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(accountTypes).map(([type, count]) => {
              const percentage =
                totalAccounts > 0 ? (count / totalAccounts) * 100 : 0
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <span className="text-muted-foreground text-sm">
                      {count} accounts ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Groups Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Account Groups Breakdown</CardTitle>
          <CardDescription>Distribution of accounts by group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(accountGroups).map(([group, count]) => {
              const percentage =
                totalAccounts > 0 ? (count / totalAccounts) * 100 : 0
              return (
                <div key={group} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{group}</span>
                    <span className="text-muted-foreground text-sm">
                      {count} accounts ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
