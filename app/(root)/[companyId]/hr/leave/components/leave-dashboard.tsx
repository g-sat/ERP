"use client"

import { useMemo, useState } from "react"
import { IEmployee } from "@/interfaces/employee"
import {
  ILeave,
  ILeaveBalance,
  ILeavePolicy,
  LeaveFormData,
  LeavePolicyFormData,
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  leaves: ILeave[]
  leaveBalances: ILeaveBalance[]
  policies: ILeavePolicy[]
  employees: Array<{
    id: string
    name: string
    employeeCode: string
    photo?: string
    department?: string
  }>
  onLeaveSubmit?: (data: LeaveFormData) => Promise<void>
  onLeaveEdit?: (leave: ILeave) => void
  onLeaveDelete?: (leaveId: string) => void
  onLeaveApprove?: (leaveId: string) => void
  onLeaveReject?: (leaveId: string) => void
  onPolicySubmit?: (data: LeavePolicyFormData) => Promise<void>
  onPolicyEdit?: (policy: ILeavePolicy) => void
  onEmployeeView?: (employee: {
    id: string
    name: string
    employeeCode: string
    photo?: string
    department?: string
  }) => void
  onApprovalView?: (leave: ILeave) => void
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
  onEmployeeView,
  onApprovalView,
}: LeaveDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  // Filter leaves based on search and filters
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch =
        leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" || leave.statusName === statusFilter
      const matchesType =
        typeFilter === "ALL" || leave.leaveTypeName === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [leaves, searchTerm, statusFilter, typeFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLeaves = leaves.length
    const pendingLeaves = leaves.filter(
      (leave) => leave.statusName === "PENDING"
    ).length
    const approvedLeaves = leaves.filter(
      (leave) => leave.statusName === "APPROVED"
    ).length
    const rejectedLeaves = leaves.filter(
      (leave) => leave.statusName === "REJECTED"
    ).length

    const totalDays = leaves.reduce((sum, leave) => sum + leave.totalDays, 0)
    const pendingDays = leaves
      .filter((leave) => leave.statusName === "PENDING")
      .reduce((sum, leave) => sum + leave.totalDays, 0)
    const approvedDays = leaves
      .filter((leave) => leave.statusName === "APPROVED")
      .reduce((sum, leave) => sum + leave.totalDays, 0)
    const rejectedDays = leaves
      .filter((leave) => leave.statusName === "REJECTED")
      .reduce((sum, leave) => sum + leave.totalDays, 0)

    return {
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalDays,
      pendingDays,
      approvedDays,
      rejectedDays,
    }
  }, [leaves])

  // Get unique statuses and types for filters
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(leaves.map((leave) => leave.statusName))]
    return ["ALL", ...uniqueStatuses]
  }, [leaves])

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(leaves.map((leave) => leave.leaveTypeName))]
    return ["ALL", ...uniqueTypes]
  }, [leaves])

  const handleLeaveSubmit = async (data: LeaveFormData) => {
    if (onLeaveSubmit) {
      await onLeaveSubmit(data)
    }
  }

  const handlePolicySubmit = async (data: LeavePolicyFormData) => {
    if (onPolicySubmit) {
      await onPolicySubmit(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Leave Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeaves}</div>
            <p className="text-muted-foreground text-xs">
              {stats.totalDays} total days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingLeaves}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.pendingDays} days pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedLeaves}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.approvedDays} days approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejectedLeaves}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.rejectedDays} days rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaves.slice(0, 5).map((leave) => (
                    <div
                      key={leave.leaveId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={leave.employeePhoto} />
                          <AvatarFallback>
                            {leave.employeeName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{leave.employeeName}</p>
                          <p className="text-muted-foreground text-sm">
                            {leave.leaveTypeName} • {leave.totalDays} days
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          leave.statusName === "APPROVED"
                            ? "default"
                            : leave.statusName === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {leave.statusName}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveBalances.slice(0, 5).map((balance) => (
                    <div
                      key={balance.leaveBalanceId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          Employee ID: {balance.employeeId}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Type ID: {balance.leaveTypeId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {balance.remainingBalance} remaining
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {balance.totalUsed} used
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leave Requests</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LeaveTable
                leaves={filteredLeaves}
                onEdit={onLeaveEdit}
                onDelete={onLeaveDelete}
                onApprove={onLeaveApprove}
                onReject={onLeaveReject}
                onApprovalView={onApprovalView}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaveBalanceTable balances={leaveBalances} policies={policies} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <LeavePolicyForm
                policies={policies}
                onSubmit={handlePolicySubmit}
                onEdit={onPolicyEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Leave Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
                    onClick={() => onEmployeeView?.(employee)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.photo} />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {employee.employeeCode}
                        </p>
                        {employee.department && (
                          <p className="text-muted-foreground text-xs">
                            {employee.department}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Leave Summary
                      </span>
                      <Badge variant="outline">View Details</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Request Form Dialog */}
      <LeaveRequestForm
        employees={employees}
        policies={policies}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  )
}
