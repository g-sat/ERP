"use client"

import { useState } from "react"
import {
  APPROVAL_ACTION_TYPES,
  APPROVAL_STATUS,
  IApprovalRequest,
} from "@/interfaces/approval"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import { CheckCircle, Clock, Eye, XCircle } from "lucide-react"

import { useApproval } from "@/hooks/use-approval"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ApprovalRequestTableProps {
  requests: IApprovalRequest[]
  onViewDetail: (requestId: number) => void
  showActions: boolean
  isLoading: boolean
}

export function ApprovalRequestTable({
  requests,
  onViewDetail,
  showActions,
  isLoading,
}: ApprovalRequestTableProps) {
  const { user } = useAuthStore()
  const {
    takeApprovalAction,
    canTakeAction,
    getStatusBadgeVariant,
    getStatusText,
  } = useApproval()
  const [processingAction, setProcessingAction] = useState<number | null>(null)

  const handleAction = async (
    requestId: number,
    actionTypeId: number,
    remarks?: string
  ) => {
    setProcessingAction(requestId)
    try {
      const request = requests.find((r) => r.requestId === requestId)
      if (!request) return

      const success = await takeApprovalAction({
        requestId,
        levelId: request.currentLevelId,
        actionTypeId,
        remarks,
      })

      if (success) {
        // The hook will refresh the data
      }
    } finally {
      setProcessingAction(null)
    }
  }

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case APPROVAL_STATUS.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case APPROVAL_STATUS.REJECTED:
        return <XCircle className="h-4 w-4 text-red-600" />
      case APPROVAL_STATUS.PENDING:
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-12 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground">
          {showActions ? "No pending approvals found" : "No requests found"}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Process</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Level</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.requestId}>
              <TableCell className="font-medium">
                {request.referenceId}
              </TableCell>
              <TableCell>{request.processName || "N/A"}</TableCell>
              <TableCell>{request.requestedByName || "N/A"}</TableCell>
              <TableCell>
                {format(new Date(request.requestedDate), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.statusTypeId)}
                  <Badge variant={getStatusBadgeVariant(request.statusTypeId)}>
                    {getStatusText(request.statusTypeId)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>Level {request.currentLevelNumber || "N/A"}</TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(request.requestId)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    {canTakeAction(
                      request,
                      parseInt(user?.userRoleId || "0")
                    ) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(
                                request.requestId,
                                APPROVAL_ACTION_TYPES.APPROVED
                              )
                            }
                            disabled={processingAction === request.requestId}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(
                                request.requestId,
                                APPROVAL_ACTION_TYPES.REJECTED
                              )
                            }
                            disabled={processingAction === request.requestId}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
