"use client"

import { useMemo, useState } from "react"
import {
  Leave,
  LeaveBalance,
  LeavePolicy,
  LeaveStatus,
  LeaveType,
} from "@/interfaces/leave"
import {
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LeaveBalanceTable } from "./leave-balance-table"
import { LeavePolicyForm } from "./leave-policy-form"
import { LeaveRequestForm } from "./leave-request-form"
import { LeaveTable } from "./leave-table"

interface LeaveDashboardProps {
  leaves: Leave[]
  leaveBalances: LeaveBalance[]
  policies: LeavePolicy[]
  employees: Array<{
    id: string
    name: string
    employeeCode: string
    photo?: string
    department?: string
  }>
  onLeaveSubmit?: (data: any) => Promise<void>
  onLeaveEdit?: (leave: Leave) => void
  onLeaveDelete?: (leaveId: string) => void
  onLeaveApprove?: (leaveId: string) => void
  onLeaveReject?: (leaveId: string) => void
  onPolicySubmit?: (data: any) => Promise<void>
  onPolicyEdit?: (policy: LeavePolicy) => void
}

export function LeaveDashboard({
  leaves,
  leaveBalances,
  policies,
  employees,
  onLeaveSubmit,
  onLeaveEdit,
  onLeaveDelete,
  onLeaveApprove,
  onLeaveReject,
  onPolicySubmit,
  onPolicyEdit,
}: LeaveDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<LeaveType | "ALL">("ALL")

  // Filter leaves based on search and filters
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch =
        leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" || leave.status === statusFilter
      const matchesType = typeFilter === "ALL" || leave.leaveType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [leaves, searchTerm, statusFilter, typeFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLeaves = leaves.length
    const pendingLeaves = leaves.filter((l) => l.status === "PENDING").length
    const approvedLeaves = leaves.filter((l) => l.status === "APPROVED").length
    const rejectedLeaves = leaves.filter((l) => l.status === "REJECTED").length
    const totalDays = leaves.reduce((sum, l) => sum + l.totalDays, 0)
    const totalEmployees = new Set(leaves.map((l) => l.employeeId)).size

    return {
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalDays,
      totalEmployees,
    }
  }, [leaves])

  // Calculate leave balance statistics
  const balanceStats = useMemo(() => {
    const totalAllocated = leaveBalances.reduce(
      (sum, b) => sum + b.totalAllocated,
      0
    )
    const totalUsed = leaveBalances.reduce((sum, b) => sum + b.totalUsed, 0)
    const totalRemaining = leaveBalances.reduce(
      (sum, b) => sum + b.remainingBalance,
      0
    )
    const lowBalanceCount = leaveBalances.filter(
      (b) => b.remainingBalance < 5
    ).length

    return {
      totalAllocated,
      totalUsed,
      totalRemaining,
      lowBalanceCount,
    }
  }, [leaveBalances])

  const handleLeaveSubmit = async (data: any) => {
    if (onLeaveSubmit) {
      await onLeaveSubmit(data)
    }
  }

  const handlePolicySubmit = async (data: any) => {
    if (onPolicySubmit) {
      await onPolicySubmit(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600">
            Manage employee leave requests and policies
          </p>
        </div>
        <div className="flex space-x-2">
          <LeaveRequestForm
            onSubmit={handleLeaveSubmit}
            employees={employees}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            }
          />
          <LeavePolicyForm
            onSubmit={handlePolicySubmit}
            trigger={
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Add Policy
              </Button>
            }
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Requests
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.totalLeaves}</div>
            <div className="text-xs text-gray-500">
              {stats.totalDays} total days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-yellow-600">
              {stats.pendingLeaves}
            </div>
            <div className="text-xs text-gray-500">Awaiting approval</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Approved
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {stats.approvedLeaves}
            </div>
            <div className="text-xs text-gray-500">Successfully approved</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Employees
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold">
              {stats.totalEmployees}
            </div>
            <div className="text-xs text-gray-500">With leave requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Leave Balance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {balanceStats.totalAllocated}
              </div>
              <div className="text-sm text-gray-600">Total Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {balanceStats.totalUsed}
              </div>
              <div className="text-sm text-gray-600">Total Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {balanceStats.totalRemaining}
              </div>
              <div className="text-sm text-gray-600">Total Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {balanceStats.lowBalanceCount}
              </div>
              <div className="text-sm text-gray-600">Low Balance Alert</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaveTable
                  leaves={leaves.slice(0, 5)}
                  onEdit={onLeaveEdit}
                  onDelete={onLeaveDelete}
                  onApprove={onLeaveApprove}
                  onReject={onLeaveReject}
                  showActions={true}
                />
              </CardContent>
            </Card>

            {/* Leave Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    leaves.reduce(
                      (acc, leave) => {
                        acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>
                    )
                  ).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {type.replace("_", " ")}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leave Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Search by employee name, code, or reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as LeaveStatus | "ALL")
                  }
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(value as LeaveType | "ALL")
                  }
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="CASUAL">Casual</SelectItem>
                    <SelectItem value="SICK">Sick</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                    <SelectItem value="MATERNITY">Maternity</SelectItem>
                    <SelectItem value="PATERNITY">Paternity</SelectItem>
                    <SelectItem value="BEREAVEMENT">Bereavement</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="COMPENSATORY">Compensatory</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Leave Requests Table */}
          <Card>
            <CardContent className="p-0">
              <LeaveTable
                leaves={filteredLeaves}
                onEdit={onLeaveEdit}
                onDelete={onLeaveDelete}
                onApprove={onLeaveApprove}
                onReject={onLeaveReject}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <LeaveBalanceTable
                leaveBalances={leaveBalances}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <Badge variant={policy.isActive ? "default" : "secondary"}>
                      {policy.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {policy.leaveType.replace("_", " ")}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      {policy.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Default:</span>
                      <div className="font-medium">
                        {policy.defaultDays} days
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Max:</span>
                      <div className="font-medium">{policy.maxDays} days</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Notice:</span>
                      <div className="font-medium">
                        {policy.advanceNoticeDays} days
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Approval:</span>
                      <div className="font-medium">
                        {policy.requiresApproval ? "Required" : "Not Required"}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPolicyEdit?.(policy)}
                    >
                      <Settings className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
