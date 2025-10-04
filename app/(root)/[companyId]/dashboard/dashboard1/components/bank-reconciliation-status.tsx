"use client"

import { useMemo } from "react"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface BankReconciliationStatusProps {
  period: string
  entities: string[]
}

interface ReconciliationData {
  totalTransactions: number
  reconciledTransactions: number
  unreconciledTransactions: number
  percentageReconciled: number
  lastReconciledDate: string
  overdueReconciliations: number
  reconciliationCycleStart: string
  reconciliationCycleEnd: string
}

export function BankReconciliationStatus({
  period,
  entities,
}: BankReconciliationStatusProps) {
  // Mock data - in real implementation, this would come from API
  const mockData: ReconciliationData = useMemo(() => {
    const totalTransactions =
      period === "qtd" ? 1250 : period === "ytd" ? 5500 : 425
    const reconciliationRate = 0.85 + Math.random() * 0.1 // 85-95% reconciled
    const reconciledTransactions = Math.floor(
      totalTransactions * reconciliationRate
    )
    const unreconciledTransactions = totalTransactions - reconciledTransactions
    const percentageReconciled =
      (reconciledTransactions / totalTransactions) * 100

    // Simulate some overdue reconciliations
    const overdueReconciliations = Math.floor(unreconciledTransactions * 0.3)

    return {
      totalTransactions,
      reconciledTransactions,
      unreconciledTransactions,
      percentageReconciled,
      lastReconciledDate: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      overdueReconciliations,
      reconciliationCycleStart: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString(),
      reconciliationCycleEnd: new Date().toISOString(),
    }
  }, [period])

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600"
    if (percentage >= 85) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 95)
      return <CheckCircle className="h-5 w-5 text-green-600" />
    if (percentage >= 85) return <Clock className="h-5 w-5 text-yellow-600" />
    return <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  const getStatusText = (percentage: number) => {
    if (percentage >= 95) return "Excellent"
    if (percentage >= 85) return "Good"
    return "Needs Attention"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getGaugeColor = (percentage: number) => {
    if (percentage >= 95) return "#10b981" // green
    if (percentage >= 85) return "#f59e0b" // yellow
    return "#ef4444" // red
  }

  const isLoading = false // Would be managed by parent component

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bank Reconciliation Status</CardTitle>
          <CardDescription>
            Track progress and timeliness of bank reconciliation process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(mockData.percentageReconciled)}
              Bank Reconciliation Status
            </CardTitle>
            <CardDescription>
              Track progress and timeliness of bank reconciliation process
            </CardDescription>
          </div>
          <Badge
            variant={
              mockData.percentageReconciled >= 95
                ? "default"
                : mockData.percentageReconciled >= 85
                  ? "secondary"
                  : "destructive"
            }
            className="text-xs"
          >
            {getStatusText(mockData.percentageReconciled)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Central Gauge Chart */}
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 120 120"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={getGaugeColor(mockData.percentageReconciled)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - mockData.percentageReconciled / 100)}`}
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getStatusColor(mockData.percentageReconciled)}`}
                >
                  {mockData.percentageReconciled.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-xs">Reconciled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Unreconciled
            </div>
            <div
              className={`text-xl font-bold ${mockData.unreconciledTransactions > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {mockData.unreconciledTransactions}
            </div>
            <div className="text-muted-foreground text-xs">Transactions</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Last Reconciled
            </div>
            <div className="text-lg font-bold">
              {formatDate(mockData.lastReconciledDate)}
            </div>
            <div className="text-muted-foreground text-xs">
              {Math.floor(
                (Date.now() - new Date(mockData.lastReconciledDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days ago
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-2">
          <div className="bg-muted/30 flex items-center justify-between rounded p-2">
            <span className="text-sm font-medium">Total Transactions</span>
            <span className="text-sm font-bold">
              {mockData.totalTransactions.toLocaleString()}
            </span>
          </div>

          <div className="bg-muted/30 flex items-center justify-between rounded p-2">
            <span className="text-sm font-medium">Reconciled Transactions</span>
            <span className="text-sm font-bold text-green-600">
              {mockData.reconciledTransactions.toLocaleString()}
            </span>
          </div>

          {mockData.overdueReconciliations > 0 && (
            <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 p-2">
              <span className="text-sm font-medium text-red-700">
                Overdue Reconciliations
              </span>
              <span className="text-sm font-bold text-red-600">
                {mockData.overdueReconciliations}
              </span>
            </div>
          )}
        </div>

        {/* Reconciliation Cycle Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="mb-1 text-sm font-medium text-blue-800">
            Current Reconciliation Cycle
          </div>
          <div className="text-xs text-blue-700">
            {formatDate(mockData.reconciliationCycleStart)} -{" "}
            {formatDate(mockData.reconciliationCycleEnd)}
          </div>
        </div>

        {/* Drill-down Action */}
        <div className="border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full"
            onClick={() => {
              // Navigate to Unreconciled Transactions list
              console.log("Navigate to Unreconciled Transactions")
            }}
          >
            View Unreconciled Transactions →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
