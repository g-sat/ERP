"use client"

import { IJobOrderHd } from "@/interfaces/checklist"
import { Activity, AlertTriangle, Clock, TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ChecklistAnalyticsFallbackProps {
  data: IJobOrderHd[]
  isLoading?: boolean
}

export function ChecklistAnalyticsFallback({
  data,
  isLoading = false,
}: ChecklistAnalyticsFallbackProps) {
  // Calculate basic metrics
  const total = data.length
  const completed = data.filter((job) => job.statusName === "Completed").length
  const pending = data.filter((job) => job.statusName === "Pending").length
  const cancelled = data.filter((job) => job.statusName === "Cancelled").length

  const completionRate = total > 0 ? (completed / total) * 100 : 0
  const pendingRate = total > 0 ? (pending / total) * 100 : 0
  const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 animate-pulse rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-8 animate-pulse rounded bg-gray-200" />
                <div className="h-3 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-muted-foreground text-xs">All time jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completionRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
            <p className="text-muted-foreground text-xs">
              {pendingRate.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancellation Rate
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cancellationRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {cancelled} cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>
            Current distribution of job statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-20 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-sm">
                  {completed}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-20 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{ width: `${pendingRate}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-sm">{pending}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancelled</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-20 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${cancellationRate}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-sm">
                  {cancelled}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Latest job orders in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.slice(0, 5).map((job, index) => (
              <div
                key={job.jobOrderId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{job.jobOrderNo}</p>
                    <p className="text-muted-foreground text-xs">
                      {job.customerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      job.statusName === "Completed"
                        ? "bg-green-100 text-green-800"
                        : job.statusName === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : job.statusName === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.statusName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
