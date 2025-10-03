"use client"

import { useMemo, useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Ship,
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

import { ChecklistAnalytics } from "./checklist-analytics"
import { ChecklistDashboardSummary } from "./checklist-dashboard-summary"
import { RoleBasedDashboard } from "./role-based-dashboard"

interface ChecklistDashboardProps {
  data: IJobOrderHd[]
  isLoading?: boolean
}

export function ChecklistDashboard({
  data,
  isLoading = false,
}: ChecklistDashboardProps) {
  const { user } = useAuthStore()

  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedView, setSelectedView] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Determine user role and permissions
  const userRole = user?.userRoleName || "Clerk"
  const isAdmin = userRole === "Admin"
  const isManager = userRole === "Manager"
  const isClerk = userRole === "Clerk"

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const totalJobs = data.length
    const pendingJobs = data.filter(
      (job) => job.statusName === "Pending"
    ).length
    const completedJobs = data.filter(
      (job) => job.statusName === "Completed"
    ).length
    const cancelledJobs = data.filter(
      (job) => job.statusName === "Cancelled"
    ).length
    const confirmedJobs = data.filter(
      (job) => job.statusName === "Confirmed"
    ).length

    // Calculate completion rate
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0

    // Calculate average processing time (simplified)
    const avgProcessingTime = totalJobs > 0 ? Math.round(totalJobs * 1.5) : 0 // days

    // Calculate revenue (placeholder - would need to be calculated from related data)
    const totalRevenue = 0

    return {
      totalJobs,
      pendingJobs,
      completedJobs,
      cancelledJobs,
      confirmedJobs,
      completionRate,
      avgProcessingTime,
      totalRevenue,
    }
  }, [data])

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    return data.filter(
      (job) =>
        job.jobOrderNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.vesselName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  // Get recent jobs
  const recentJobs = useMemo(() => {
    return filteredData
      .sort(
        (a, b) =>
          new Date(b.jobOrderDate || 0).getTime() -
          new Date(a.jobOrderDate || 0).getTime()
      )
      .slice(0, 5)
  }, [filteredData])

  // Status distribution for charts
  const statusDistribution = useMemo(() => {
    const statuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
      "Cancel With Service",
      "Posted",
    ]
    return statuses.map((status) => ({
      status,
      count: data.filter((job) => job.statusName === status).length,
      percentage:
        data.length > 0
          ? (data.filter((job) => job.statusName === status).length /
              data.length) *
            100
          : 0,
    }))
  }, [data])

  // Role-based dashboard content
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalJobs}</div>
            <p className="text-muted-foreground text-xs">
              +12% from last month
            </p>
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
              {metrics.completionRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Processing Time
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgProcessingTime}d
            </div>
            <p className="text-muted-foreground text-xs">
              -3 days from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>
              Current status breakdown of all jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map(({ status, count, percentage }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        status === "Pending"
                          ? "bg-yellow-500"
                          : status === "Completed"
                            ? "bg-green-500"
                            : status === "Cancelled"
                              ? "bg-red-500"
                              : status === "Confirmed"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground text-sm">
                      {count}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest job orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.jobOrderId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{job.jobOrderNo}</p>
                      <p className="text-muted-foreground text-xs">
                        {job.customerName}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      job.statusName === "Pending"
                        ? "secondary"
                        : job.statusName === "Completed"
                          ? "default"
                          : job.statusName === "Cancelled"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {job.statusName}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderManagerDashboard = () => (
    <div className="space-y-6">
      {/* Manager-specific metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Team&apos;s Jobs
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalJobs}</div>
            <p className="text-muted-foreground text-xs">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingJobs}</div>
            <p className="text-muted-foreground text-xs">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedJobs}</div>
            <p className="text-muted-foreground text-xs">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Overview</CardTitle>
          <CardDescription>
            Key metrics for your team&apos;s checklist management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Status Breakdown</h4>
              <div className="space-y-2">
                {statusDistribution
                  .slice(0, 4)
                  .map(({ status, count, percentage }) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{status}</span>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-20 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${
                              status === "Pending"
                                ? "bg-yellow-500"
                                : status === "Completed"
                                  ? "bg-green-500"
                                  : status === "Cancelled"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-8 text-xs">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Review Pending Jobs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Team Assignments
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderClerkDashboard = () => (
    <div className="space-y-6">
      {/* Clerk-specific metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Assigned Jobs
            </CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalJobs}</div>
            <p className="text-muted-foreground text-xs">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingJobs}</div>
            <p className="text-muted-foreground text-xs">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Your assigned checklist items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.jobOrderId}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Ship className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{job.jobOrderNo}</p>
                    <p className="text-muted-foreground text-sm">
                      {job.customerName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {job.vesselName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      job.statusName === "Pending"
                        ? "secondary"
                        : job.statusName === "Completed"
                          ? "default"
                          : "outline"
                    }
                  >
                    {job.statusName}
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <CheckCircle className="mb-2 h-6 w-6" />
              Mark Complete
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Clock className="mb-2 h-6 w-6" />
              Update Status
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="mb-2 h-6 w-6" />
              Schedule Task
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="mb-2 h-6 w-6" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Checklist Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.userName}. Here&apos;s your checklist overview.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Role-based content */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="role-based">Role-Based</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isAdmin && renderAdminDashboard()}
          {isManager && renderManagerDashboard()}
          {isClerk && renderClerkDashboard()}
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <ChecklistDashboardSummary
            totalJobs={metrics.totalJobs}
            completedJobs={metrics.completedJobs}
            pendingJobs={metrics.pendingJobs}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="role-based" className="space-y-6">
          <RoleBasedDashboard data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ChecklistAnalytics data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Exports</CardTitle>
              <CardDescription>Generate and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <Download className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Reports view coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
