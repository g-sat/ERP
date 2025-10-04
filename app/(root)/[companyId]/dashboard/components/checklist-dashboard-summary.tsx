"use client"

import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ChecklistDashboardSummaryProps {
  totalJobs: number
  completedJobs: number
  pendingJobs: number
  userRole: string
}

export function ChecklistDashboardSummary({
  totalJobs,
  completedJobs,
  pendingJobs,
  userRole,
}: ChecklistDashboardSummaryProps) {
  const _completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Shield className="h-5 w-5 text-red-600" />
      case "Manager":
        return <Users className="h-5 w-5 text-blue-600" />
      case "Clerk":
        return <UserCheck className="h-5 w-5 text-green-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "Admin":
        return "Full system access and administrative controls"
      case "Manager":
        return "Team management and oversight capabilities"
      case "Clerk":
        return "Task execution and checklist management"
      default:
        return "Standard user access"
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRoleIcon(userRole)}
            Checklist Dashboard Overview
          </CardTitle>
          <CardDescription>{getRoleDescription(userRole)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Jobs</p>
                <p className="text-2xl font-bold">{totalJobs}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedJobs}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{pendingJobs}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">
              Comprehensive analytics with charts and insights
            </p>
            <div className="space-y-1">
              <Badge variant="outline">Status Distribution</Badge>
              <Badge variant="outline">Monthly Trends</Badge>
              <Badge variant="outline">Performance Metrics</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Role-Based Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">
              Personalized dashboards for different user roles
            </p>
            <div className="space-y-1">
              <Badge variant="outline">Admin Controls</Badge>
              <Badge variant="outline">Manager Tools</Badge>
              <Badge variant="outline">Clerk Tasks</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">
              Live data updates and status tracking
            </p>
            <div className="space-y-1">
              <Badge variant="outline">Live Status</Badge>
              <Badge variant="outline">Auto Refresh</Badge>
              <Badge variant="outline">Notifications</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Dashboard Access</CardTitle>
          <CardDescription>
            Based on your role: <Badge variant="secondary">{userRole}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRole === "Admin" && (
              <div className="space-y-2">
                <h4 className="font-medium">Administrative Features:</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Full system overview and metrics</li>
                  <li>• User management and permissions</li>
                  <li>• System configuration and settings</li>
                  <li>• Advanced analytics and reporting</li>
                  <li>• Security and audit controls</li>
                </ul>
              </div>
            )}

            {userRole === "Manager" && (
              <div className="space-y-2">
                <h4 className="font-medium">Management Features:</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Team performance monitoring</li>
                  <li>• Task assignment and oversight</li>
                  <li>• Approval workflows</li>
                  <li>• Team reports and analytics</li>
                  <li>• Resource allocation tools</li>
                </ul>
              </div>
            )}

            {userRole === "Clerk" && (
              <div className="space-y-2">
                <h4 className="font-medium">Task Management Features:</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Personal task dashboard</li>
                  <li>• Checklist completion tracking</li>
                  <li>• Status updates and reporting</li>
                  <li>• Quick action shortcuts</li>
                  <li>• Activity history and logs</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
