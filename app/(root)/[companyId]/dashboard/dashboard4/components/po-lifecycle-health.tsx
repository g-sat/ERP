"use client"

import { useState } from "react"
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  XCircleIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface POLifecycleHealthProps {
  period: string
  comparisonPeriod: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface POLifecycleStage {
  stage: string
  count: number
  value: number
  percentage: number
  avgDays: number
  color: string
}

interface POMetrics {
  totalOpenPOValue: number
  avgPOCycleTime: number
  threeWayMatchExceptions: number
  grniValue: number
  stuckPOs: number
}

export function POLifecycleHealth({
  period: _period,
  comparisonPeriod: _comparisonPeriod,
  businessUnits: _businessUnits,
  productLines: _productLines,
  geography: _geography,
}: POLifecycleHealthProps) {
  const [selectedStage, setSelectedStage] = useState<string>("all")

  // Mock data - in real implementation, this would come from API
  const lifecycleStages: POLifecycleStage[] = [
    {
      stage: "POs Drafted",
      count: 1250,
      value: 8500000,
      percentage: 100,
      avgDays: 2,
      color: "#3b82f6",
    },
    {
      stage: "POs Approved",
      count: 1180,
      value: 8100000,
      percentage: 94.4,
      avgDays: 3,
      color: "#8b5cf6",
    },
    {
      stage: "POs Sent",
      count: 1100,
      value: 7500000,
      percentage: 88.0,
      avgDays: 5,
      color: "#06b6d4",
    },
    {
      stage: "Goods Received",
      count: 980,
      value: 6800000,
      percentage: 78.4,
      avgDays: 12,
      color: "#10b981",
    },
    {
      stage: "Invoiced",
      count: 920,
      value: 6200000,
      percentage: 73.6,
      avgDays: 18,
      color: "#f59e0b",
    },
    {
      stage: "Paid",
      count: 890,
      value: 5900000,
      percentage: 71.2,
      avgDays: 25,
      color: "#ef4444",
    },
  ]

  const metrics: POMetrics = {
    totalOpenPOValue: 12500000,
    avgPOCycleTime: 25,
    threeWayMatchExceptions: 12.5,
    grniValue: 2300000,
    stuckPOs: 45,
  }

  const cycleTimeData = [
    { month: "Jan", avgDays: 28, target: 20 },
    { month: "Feb", avgDays: 26, target: 20 },
    { month: "Mar", avgDays: 25, target: 20 },
    { month: "Apr", avgDays: 24, target: 20 },
    { month: "May", avgDays: 25, target: 20 },
    { month: "Jun", avgDays: 25, target: 20 },
  ]

  const exceptionTypes = [
    { type: "Price Mismatch", count: 8, percentage: 32 },
    { type: "Quantity Variance", count: 6, percentage: 24 },
    { type: "Missing Receipt", count: 5, percentage: 20 },
    { type: "Invoice Discrepancy", count: 4, percentage: 16 },
    { type: "Other", count: 2, percentage: 8 },
  ]

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "POs Drafted":
        return <FileTextIcon className="h-4 w-4" />
      case "POs Approved":
        return <CheckCircleIcon className="h-4 w-4" />
      case "POs Sent":
        return <FileTextIcon className="h-4 w-4" />
      case "Goods Received":
        return <CheckCircleIcon className="h-4 w-4" />
      case "Invoiced":
        return <FileTextIcon className="h-4 w-4" />
      case "Paid":
        return <CheckCircleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (stage: string) => {
    if (stage === "POs Drafted") return "bg-blue-100 text-blue-800"
    if (stage === "POs Approved") return "bg-purple-100 text-purple-800"
    if (stage === "POs Sent") return "bg-cyan-100 text-cyan-800"
    if (stage === "Goods Received") return "bg-green-100 text-green-800"
    if (stage === "Invoiced") return "bg-yellow-100 text-yellow-800"
    if (stage === "Paid") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
      value: number
      dataKey: string
      color: string
      payload: Record<string, unknown>
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label: _label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
          <p className="font-medium">{data.stage}</p>
          <p className="text-muted-foreground text-sm">
            Count: {data.count.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm">
            Value: ${data.value.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
          <p className="text-muted-foreground text-sm">
            Avg Days: {data.avgDays}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5" />
          PO Lifecycle Health
          <Badge variant="outline" className="text-xs">
            Procurement Process Monitoring
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Tiles */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Open PO Value
                </span>
              </div>
              <div className="mt-1 text-2xl font-bold text-blue-900">
                ${(metrics.totalOpenPOValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Avg Cycle Time
                </span>
              </div>
              <div className="mt-1 text-2xl font-bold text-green-900">
                {metrics.avgPOCycleTime} days
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  3-Way Exceptions
                </span>
              </div>
              <div className="mt-1 text-2xl font-bold text-yellow-900">
                {metrics.threeWayMatchExceptions}%
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <XCircleIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  GRNI Value
                </span>
              </div>
              <div className="mt-1 text-2xl font-bold text-red-900">
                ${(metrics.grniValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium">PO Lifecycle Funnel</h4>
            <Badge variant="outline" className="text-xs">
              {selectedStage === "all" ? "All Stages" : selectedStage}
            </Badge>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="count"
                  data={lifecycleStages}
                  isAnimationActive={true}
                >
                  {lifecycleStages.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                    />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Details */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lifecycleStages.map((stage, _index) => (
              <Card
                key={stage.stage}
                className={`cursor-pointer transition-colors ${
                  selectedStage === stage.stage ? "ring-primary ring-2" : ""
                }`}
                onClick={() => setSelectedStage(stage.stage)}
              >
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStageIcon(stage.stage)}
                      <span className="text-sm font-medium">{stage.stage}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(stage.stage)}`}
                    >
                      {stage.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold">
                      {stage.count.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      ${(stage.value / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Avg: {stage.avgDays} days
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cycle Time Trend */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Cycle Time Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#3b82f6" name="Average Days" />
                <Bar dataKey="target" fill="#ef4444" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exception Analysis */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium">3-Way Match Exceptions</h4>
          <div className="space-y-3">
            {exceptionTypes.map((exception, _index) => (
              <div
                key={exception.type}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">{exception.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground text-sm">
                    {exception.count} cases ({exception.percentage}%)
                  </div>
                  <div className="w-24">
                    <Progress value={exception.percentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Action Items
              </span>
            </div>
            <div className="space-y-2 text-xs text-yellow-700">
              <div>
                • {metrics.stuckPOs} POs stuck in approval for &gt;10 days
              </div>
              <div>• Price mismatch exceptions increased by 15% this month</div>
              <div>
                • GRNI value exceeds target by $800K - investigate receipts
              </div>
              <div>• Cycle time improvement needed to meet 20-day target</div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
