"use client"

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Dashboard3Filters {
  dateRange: { from: Date; to: Date } | undefined
  supplierCategory: string[]
  paymentTerms: string
  approvalStatus: string
  legalEntity: string[]
}

interface APAgingData {
  bucket: string
  amount: number
  count: number
  color: string
}

interface APAgingSummaryProps {
  filters: Dashboard3Filters
}

export default function APAgingSummary({
  filters: _filters,
}: APAgingSummaryProps) {
  // Mock data - replace with actual API call
  const agingData: APAgingData[] = [
    {
      bucket: "Current (0-30)",
      amount: 1247500,
      count: 127,
      color: "#22c55e",
    },
    {
      bucket: "31-60 Days",
      amount: 892300,
      count: 89,
      color: "#eab308",
    },
    {
      bucket: "61-90 Days",
      amount: 456200,
      count: 42,
      color: "#f97316",
    },
    {
      bucket: "91+ Days",
      amount: 251392,
      count: 23,
      color: "#ef4444",
    },
  ]

  const totalAP = agingData.reduce((sum, item) => sum + item.amount, 0)
  const totalDue30Days = agingData[0].amount

  interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{
      value: number
      dataKey: string
      color: string
      payload: { count: number; amount: number; bucket: string }
    }>
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border-border rounded-lg border p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Amount:{" "}
            <span className="font-semibold">
              ${payload[0].value.toLocaleString()}
            </span>
          </p>
          <p className="text-sm">
            Invoices:{" "}
            <span className="font-semibold">{payload[0].payload.count}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const handleBarClick = (data: APAgingData) => {
    // This would trigger a drill-down to filter Widget 3.4 (Upcoming Payments)
    console.log(`Drilling down to aging bucket: ${data.bucket}`)
    // In a real implementation, this would update the parent dashboard state
    // or trigger a callback to filter the payments calendar widget
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AP Aging Summary
          <Badge variant="outline" className="text-xs">
            As of {new Date().toLocaleDateString()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Outstanding accounts payable by aging buckets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metric */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${totalDue30Days.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Payables Due Within 30 Days
              </div>
            </div>
          </div>

          {/* Aging Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={agingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  onClick={handleBarClick}
                  style={{ cursor: "pointer" }}
                >
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Aging Bucket Details */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {agingData.map((item, index) => (
              <div
                key={index}
                className="hover:bg-muted/50 cursor-pointer rounded-lg border p-3 transition-colors"
                onClick={() => handleBarClick(item)}
              >
                <div className="mb-1 flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium">{item.bucket}</span>
                </div>
                <div className="text-lg font-bold">
                  ${(item.amount / 1000).toFixed(0)}K
                </div>
                <div className="text-muted-foreground text-xs">
                  {item.count} invoices
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Total Outstanding AP:
                </span>
                <span className="ml-2 font-semibold">
                  ${totalAP.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Invoices:</span>
                <span className="ml-2 font-semibold">
                  {agingData.reduce((sum, item) => sum + item.count, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
