"use client"

import React from "react"
import { LeaveBalance, LeaveType } from "@/interfaces/leave"
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LeaveBalanceTableProps {
  leaveBalances: LeaveBalance[]
  onEdit?: (balance: LeaveBalance) => void
  onView?: (balance: LeaveBalance) => void
  onAddBalance?: (employeeId: string) => void
  showActions?: boolean
}

export function LeaveBalanceTable({
  leaveBalances,
  onEdit,
  onView,
  onAddBalance,
  showActions = true,
}: LeaveBalanceTableProps) {
  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case "CASUAL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "SICK":
        return "bg-red-100 text-red-800 border-red-200"
      case "ANNUAL":
        return "bg-green-100 text-green-800 border-green-200"
      case "MATERNITY":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "PATERNITY":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "BEREAVEMENT":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "UNPAID":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "COMPENSATORY":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "OTHER":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUsagePercentage = (used: number, allocated: number) => {
    if (allocated === 0) return 0
    return Math.round((used / allocated) * 100)
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return "critical"
    if (percentage >= 75) return "warning"
    if (percentage >= 50) return "moderate"
    return "good"
  }

  const getUsageColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-orange-500"
      case "moderate":
        return "bg-yellow-500"
      case "good":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90)
      return <TrendingDown className="h-4 w-4 text-red-600" />
    if (percentage >= 75)
      return <TrendingDown className="h-4 w-4 text-orange-600" />
    if (percentage >= 50)
      return <TrendingUp className="h-4 w-4 text-yellow-600" />
    return <TrendingUp className="h-4 w-4 text-green-600" />
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Allocated</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Year</TableHead>
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveBalances.map((balance) => {
            const usagePercentage = getUsagePercentage(
              balance.totalUsed,
              balance.totalAllocated
            )
            const usageStatus = getUsageStatus(usagePercentage)

            return (
              <TableRow key={balance.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {balance.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{balance.employeeName}</div>
                      <div className="text-sm text-gray-500">
                        {balance.employeeCode}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getLeaveTypeColor(balance.leaveType)}
                  >
                    {balance.leaveType.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {balance.totalAllocated} days
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {balance.totalUsed} days
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {balance.totalPending} days
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        balance.remainingBalance < 5
                          ? "text-red-600"
                          : balance.remainingBalance < 10
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {balance.remainingBalance} days
                    </span>
                    {getUsageIcon(usagePercentage)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {usagePercentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {balance.totalUsed}/{balance.totalAllocated}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                    <div className="flex items-center space-x-1">
                      <div
                        className={`h-2 w-2 rounded-full ${getUsageColor(usageStatus)}`}
                      />
                      <span className="text-xs text-gray-500 capitalize">
                        {usageStatus}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{balance.year}</Badge>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView?.(balance)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(balance)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Balance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onAddBalance?.(balance.employeeId)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Balance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Employees
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold">
              {new Set(leaveBalances.map((b) => b.employeeId)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Allocated
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {leaveBalances.reduce((sum, b) => sum + b.totalAllocated, 0)} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Used
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-orange-600">
              {leaveBalances.reduce((sum, b) => sum + b.totalUsed, 0)} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Remaining
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-purple-600">
              {leaveBalances.reduce((sum, b) => sum + b.remainingBalance, 0)}{" "}
              days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Leave Usage Statistics</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">By Leave Type</h4>
              {Object.entries(
                leaveBalances.reduce(
                  (acc, balance) => {
                    acc[balance.leaveType] =
                      (acc[balance.leaveType] || 0) + balance.totalUsed
                    return acc
                  },
                  {} as Record<string, number>
                )
              ).map(([type, used]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {type.replace("_", " ")}
                  </span>
                  <Badge
                    variant="outline"
                    className={getLeaveTypeColor(type as LeaveType)}
                  >
                    {used} days
                  </Badge>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Usage Status</h4>
              {Object.entries(
                leaveBalances.reduce(
                  (acc, balance) => {
                    const percentage = getUsagePercentage(
                      balance.totalUsed,
                      balance.totalAllocated
                    )
                    const status = getUsageStatus(percentage)
                    acc[status] = (acc[status] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>
                )
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {status}
                  </span>
                  <Badge variant="outline">{count} employees</Badge>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Low Balance Alert</h4>
              {leaveBalances
                .filter((balance) => balance.remainingBalance < 5)
                .slice(0, 5)
                .map((balance) => (
                  <div
                    key={balance.id}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate text-sm text-gray-600">
                      {balance.employeeName}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-red-200 text-red-600"
                    >
                      {balance.remainingBalance} days
                    </Badge>
                  </div>
                ))}
              {leaveBalances.filter((balance) => balance.remainingBalance < 5)
                .length === 0 && (
                <p className="text-sm text-gray-500">
                  No employees with low balance
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
