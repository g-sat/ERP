"use client"

import { useState } from "react"
import { ILeave } from "@/interfaces/leave"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
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
  leaves: ILeave[]
  onEdit?: (leave: ILeave) => void
  onDelete?: (leaveId: string) => void
  onView?: (leave: ILeave) => void
  onApprove?: (leaveId: string) => void
  onReject?: (leaveId: string) => void
  onApprovalView?: (leave: ILeave) => void
  showActions?: boolean
}

export function LeaveTable({
  leaves,
  onEdit,
  onDelete,
  onView,
  onApprove,
  onReject,
  onApprovalView,
  showActions = true,
}: LeaveTableProps) {
  const [selectedLeave, setSelectedLeave] = useState<ILeave | null>(null)

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "Annual Leave":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Sick Leave":
        return "bg-red-100 text-red-800 border-red-200"
      case "Casual Leave":
        return "bg-green-100 text-green-800 border-green-200"
      case "Maternity Leave":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "Bereavement Leave":
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
    const start = formatDate(startDate)
    const end = formatDate(endDate)
    return start === end ? start : `${start} - ${end}`
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

    if (category === "Half Day") {
      return diffDays * 0.5
    }
    return diffDays
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              {showActions && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.leaveId}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={leave.employeePhoto} />
                      <AvatarFallback>
                        {leave.employeeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{leave.employeeName}</div>
                      <div className="text-muted-foreground text-sm">
                        {leave.employeeCode}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getLeaveTypeColor(leave.leaveTypeName)}
                  >
                    {leave.leaveTypeName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">
                      {formatDateRange(
                        leave.startDate.toString(),
                        leave.endDate.toString()
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{leave.totalDays}</span>
                  <span className="text-muted-foreground text-sm"> days</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`flex items-center space-x-1 ${getStatusColor(leave.statusName)}`}
                  >
                    {getStatusIcon(leave.statusName)}
                    <span>{leave.statusName}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm">
                    {leave.reason}
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
                        {leave.statusName === "PENDING" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                onApprove?.(leave.leaveId.toString())
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onReject?.(leave.leaveId.toString())
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onApprovalView?.(leave)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Approval Workflow
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit?.(leave)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete?.(leave.leaveId.toString())}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Leave Details Dialog */}
      <Dialog
        open={!!selectedLeave}
        onOpenChange={() => setSelectedLeave(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              {/* Employee Information */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedLeave.employeePhoto} />
                      <AvatarFallback>
                        {selectedLeave.employeeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedLeave.employeeName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedLeave.employeeCode} •{" "}
                        {selectedLeave.departmentName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-2 font-medium">Leave Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                          {selectedLeave.leaveTypeName}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{selectedLeave.leaveCategoryName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days:</span>
                        <span>{selectedLeave.totalDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(selectedLeave.statusName)}
                        >
                          {selectedLeave.statusName}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-2 font-medium">Date Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Start Date:
                        </span>
                        <span>
                          {formatDate(selectedLeave.startDate.toString())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>
                          {formatDate(selectedLeave.endDate.toString())}
                        </span>
                      </div>
                      {selectedLeave.actionDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Action Date:
                          </span>
                          <span>
                            {formatDate(selectedLeave.actionDate.toString())}
                          </span>
                        </div>
                      )}
                      {selectedLeave.createDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span>
                            {formatDate(selectedLeave.createDate.toString())}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason and Notes */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 font-medium">Reason</h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {selectedLeave.reason}
                  </p>
                  {selectedLeave.notes && (
                    <>
                      <Separator className="my-4" />
                      <h4 className="mb-2 font-medium">Notes</h4>
                      <p className="text-muted-foreground text-sm">
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
                      <h4 className="mb-2 font-medium">Attachments</h4>
                      <div className="space-y-2">
                        {selectedLeave.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-2"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="text-muted-foreground h-4 w-4" />
                              <span className="text-sm">{attachment}</span>
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

              {/* Action Information */}
              {selectedLeave.actionBy && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="mb-2 font-medium">Action Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Action By:
                        </span>
                        <span>{selectedLeave.actionBy}</span>
                      </div>
                      {selectedLeave.actionRemarks && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Remarks:
                          </span>
                          <span>{selectedLeave.actionRemarks}</span>
                        </div>
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
