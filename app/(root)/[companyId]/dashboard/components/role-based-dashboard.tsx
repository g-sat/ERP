"use client"

import { useMemo } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Settings,
  Shield,
  TrendingUp,
  UserCheck,
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
import { _Tabs, _TabsContent, _TabsList, _TabsTrigger } from "@/components/ui/tabs"

interface RoleBasedDashboardProps {
  data: IJobOrderHd[]
  isLoading?: boolean
}

export function RoleBasedDashboard({
  data,
  isLoading = false,
}: RoleBasedDashboardProps) {
  const { user } = useAuthStore()

  const userRole = user?.userRoleName || "Clerk"
  const isAdmin = userRole === "Admin"
  const isManager = userRole === "Manager"
  const isClerk = userRole === "Clerk"

  // Calculate role-specific metrics
  const metrics = useMemo(() => {
    const total = data.length
    const pending = data.filter((job) => job.statusName === "Pending").length
    const completed = data.filter(
      (job) => job.statusName === "Completed"
    ).length
    const cancelled = data.filter(
      (job) => job.statusName === "Cancelled"
    ).length
    const confirmed = data.filter(
      (job) => job.statusName === "Confirmed"
    ).length

    return {
      total,
      pending,
      completed,
      cancelled,
      confirmed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      pendingRate: total > 0 ? (pending / total) * 100 : 0,
    }
  }, [data])

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Overview
            </CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-muted-foreground text-xs">
              Total jobs in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.completionRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              Overall completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attention Needed
            </CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending}</div>
            <p className="text-muted-foreground text-xs">
              Jobs requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-muted-foreground text-xs">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
          <CardDescription>
            System management and oversight tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="mb-2 h-6 w-6" />
              System Settings
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="mb-2 h-6 w-6" />
              User Management
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="mb-2 h-6 w-6" />
              System Reports
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="mb-2 h-6 w-6" />
              Security Audit
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="mb-2 h-6 w-6" />
              Performance Monitor
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="mb-2 h-6 w-6" />
              Analytics Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Manager Dashboard
  const ManagerDashboard = () => (
    <div className="space-y-6">
      {/* Team Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Performance
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.completionRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">
              Team completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending}</div>
            <p className="text-muted-foreground text-xs">
              Require your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Efficiency
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Good</div>
            <p className="text-muted-foreground text-xs">
              Performance trending up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Management Tools</CardTitle>
          <CardDescription>
            Tools for managing your team and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Team Management</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Assign Tasks
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Review Submissions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Team Reports
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Approve Pending
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  View Activity
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Clerk Dashboard
  const ClerkDashboard = () => (
    <div className="space-y-6">
      {/* Personal Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-muted-foreground text-xs">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completed}</div>
            <p className="text-muted-foreground text-xs">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Actions */}
      <Card>
        <CardHeader>
          <CardTitle>My Work</CardTitle>
          <CardDescription>
            Your assigned tasks and quick actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Clock className="mb-2 h-6 w-6" />
              Pending Tasks
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CheckCircle className="mb-2 h-6 w-6" />
              Mark Complete
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="mb-2 h-6 w-6" />
              My History
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <UserCheck className="mb-2 h-6 w-6" />
              Update Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent checklist activities</CardDescription>
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
              </div>
            ))}
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
      {/* Role Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {userRole} Dashboard
          </Badge>
          <span className="text-muted-foreground text-sm">
            Personalized view for {user?.userName}
          </span>
        </div>
      </div>

      {/* Role-based content */}
      {isAdmin && <AdminDashboard />}
      {isManager && <ManagerDashboard />}
      {isClerk && <ClerkDashboard />}
    </div>
  )
}
