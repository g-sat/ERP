"use client"

import React, { useState } from "react"
import { Leave, LeaveStatus, LeaveType } from "@/interfaces/leave"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Clock as ClockIcon,
  Download,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LeaveTableProps {
  leaves: Leave[]
  onEdit?: (leave: Leave) => void
  onDelete?: (leaveId: string) => void
  onView?: (leave: Leave) => void
  onApprove?: (leaveId: string) => void
  onReject?: (leaveId: string) => void
  showActions?: boolean
}

export function LeaveTable({
  leaves,
  onEdit,
  onDelete,
  onView,
  onApprove,
  onReject,
  showActions = true,
}: LeaveTableProps) {
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate)
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const calculateDays = (
    startDate: string,
    endDate: string,
    category: string
  ) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (category === "HALF_DAY") {
      return `${diffDays * 0.5} Half Days`
    }
    return `${diffDays} Days`
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={leave.employeePhoto} />
                    <AvatarFallback>
                      {leave.employeeName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{leave.employeeName}</div>
                    <div className="text-sm text-gray-500">
                      {leave.employeeCode} • {leave.department}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getLeaveTypeColor(leave.leaveType)}
                >
                  {leave.leaveType.replace("_", " ")}
                </Badge>
                <div className="mt-1 text-xs text-gray-500">
                  {leave.leaveCategory.replace("_", " ")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-sm">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">
                  {calculateDays(
                    leave.startDate,
                    leave.endDate,
                    leave.leaveCategory
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusColor(leave.status)}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(leave.status)}
                    <span>{leave.status}</span>
                  </div>
                </Badge>
                {leave.approvedBy && (
                  <div className="mt-1 text-xs text-gray-500">
                    Approved by {leave.approvedBy}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="truncate text-sm">{leave.reason}</p>
                  {leave.attachments && leave.attachments.length > 0 && (
                    <div className="mt-1 flex items-center space-x-1">
                      <FileText className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {leave.attachments.length} attachment(s)
                      </span>
                    </div>
                  )}
                </div>
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
                      <DropdownMenuItem onClick={() => onView?.(leave)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {leave.status === "PENDING" && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit?.(leave)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onApprove?.(leave.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onReject?.(leave.id)}
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {leave.status === "PENDING" && (
                        <DropdownMenuItem
                          onClick={() => onDelete?.(leave.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Leave Details Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setSelectedLeave(leaves[0])}
            className="hidden"
          >
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedLeave.employeePhoto} />
                      <AvatarFallback>
                        {selectedLeave.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg font-semibold">
                        {selectedLeave.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedLeave.employeeCode} •{" "}
                        {selectedLeave.department}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedLeave.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Details */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-3 font-medium">Leave Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <Badge
                          variant="outline"
                          className={getLeaveTypeColor(selectedLeave.leaveType)}
                        >
                          {selectedLeave.leaveType.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm">
                          {selectedLeave.leaveCategory.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="text-sm font-medium">
                          {calculateDays(
                            selectedLeave.startDate,
                            selectedLeave.endDate,
                            selectedLeave.leaveCategory
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-3 font-medium">Date Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Start Date:
                        </span>
                        <span className="text-sm">
                          {formatDate(selectedLeave.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">End Date:</span>
                        <span className="text-sm">
                          {formatDate(selectedLeave.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(selectedLeave.status)}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(selectedLeave.status)}
                            <span>{selectedLeave.status}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-3 font-medium">Reason for Leave</h4>
                  <p className="text-sm text-gray-700">
                    {selectedLeave.reason}
                  </p>
                  {selectedLeave.notes && (
                    <>
                      <Separator className="my-3" />
                      <h5 className="mb-2 font-medium">Additional Notes</h5>
                      <p className="text-sm text-gray-600">
                        {selectedLeave.notes}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Attachments */}
              {selectedLeave.attachments &&
                selectedLeave.attachments.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-3 font-medium">Attachments</h4>
                      <div className="space-y-2">
                        {selectedLeave.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded bg-gray-50 p-2"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                Attachment {index + 1}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Approval Information */}
              {(selectedLeave.approvedBy || selectedLeave.rejectedBy) && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-3 font-medium">
                      {selectedLeave.approvedBy ? "Approval" : "Rejection"}{" "}
                      Information
                    </h4>
                    <div className="space-y-2">
                      {selectedLeave.approvedBy && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Approved by:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedLeave.approvedBy}
                          </span>
                        </div>
                      )}
                      {selectedLeave.rejectedBy && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Rejected by:
                          </span>
                          <span className="text-sm font-medium">
                            {selectedLeave.rejectedBy}
                          </span>
                        </div>
                      )}
                      {selectedLeave.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Approved on:
                          </span>
                          <span className="text-sm">
                            {formatDate(selectedLeave.approvedAt)}
                          </span>
                        </div>
                      )}
                      {selectedLeave.rejectedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Rejected on:
                          </span>
                          <span className="text-sm">
                            {formatDate(selectedLeave.rejectedAt)}
                          </span>
                        </div>
                      )}
                      {selectedLeave.rejectionReason && (
                        <>
                          <Separator className="my-3" />
                          <div>
                            <span className="text-sm text-gray-500">
                              Rejection Reason:
                            </span>
                            <p className="mt-1 text-sm text-gray-700">
                              {selectedLeave.rejectionReason}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
