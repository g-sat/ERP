"use client"

import { useState } from "react"
import {
  APPROVAL_ACTION_TYPES,
  APPROVAL_STATUS,
  IApprovalRequestDetail,
} from "@/interfaces/approval"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react"

import { useApproval } from "@/hooks/use-approval"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ApprovalDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestDetail: IApprovalRequestDetail | null
  onClose: () => void
  isPendingApproval: boolean
}

export function ApprovalDetailDialog({
  open,
  onOpenChange,
  requestDetail,
  onClose,
  isPendingApproval,
}: ApprovalDetailDialogProps) {
  const { user } = useAuthStore()
  const {
    takeApprovalAction,
    canTakeAction,
    getStatusBadgeVariant,
    getStatusText,
    getActionTypeText,
  } = useApproval()
  const [remarks, setRemarks] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async (actionTypeId: number) => {
    if (!requestDetail) return

    setIsProcessing(true)
    try {
      const success = await takeApprovalAction({
        requestId: requestDetail.requestId,
        levelId: requestDetail.currentLevelId,
        actionTypeId,
        remarks: remarks.trim() || undefined,
      })

      if (success) {
        setRemarks("")
        onClose()
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case APPROVAL_STATUS.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case APPROVAL_STATUS.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />
      case APPROVAL_STATUS.PENDING:
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const canTakeActionOnThisRequest =
    requestDetail &&
    canTakeAction(requestDetail, parseInt(user?.userRoleId || "0"))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Approval Request Details
          </DialogTitle>
          <DialogDescription>
            Review the approval request and take necessary actions
          </DialogDescription>
        </DialogHeader>

        {requestDetail ? (
          <div className="space-y-6">
            {/* Request Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {requestDetail.referenceId}
                    </CardTitle>
                    <CardDescription>
                      {requestDetail.process?.processName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(requestDetail.statusTypeId)}
                    <Badge
                      variant={getStatusBadgeVariant(
                        requestDetail.statusTypeId
                      )}
                    >
                      {getStatusText(requestDetail.statusTypeId)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      Requested by:
                    </span>
                    <span className="font-medium">
                      {requestDetail.requestedByName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      Requested on:
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(requestDetail.requestedDate),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Current Level:
                  </span>
                  <Badge variant="outline">
                    Level {requestDetail.currentLevel?.levelNumber || "N/A"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Approval Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Levels</CardTitle>
                <CardDescription>
                  Approval workflow for this process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requestDetail.levels?.map((level) => {
                    const action = requestDetail.actions?.find(
                      (a) => a.levelId === level.levelId
                    )
                    const isCurrentLevel =
                      level.levelId === requestDetail.currentLevelId
                    const isCompleted = action !== undefined

                    return (
                      <div
                        key={level.levelId}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            isCompleted
                              ? "bg-green-100 text-green-600"
                              : isCurrentLevel
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {level.levelNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Level {level.levelNumber}
                            </span>
                            {isCurrentLevel && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                            {isCompleted && (
                              <Badge
                                variant={
                                  action?.actionTypeId ===
                                  APPROVAL_ACTION_TYPES.APPROVED
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {getActionTypeText(action?.actionTypeId || 0)}
                              </Badge>
                            )}
                          </div>
                          {action && (
                            <div className="text-muted-foreground mt-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span>By: {action.actionByName}</span>
                                <span>•</span>
                                <span>
                                  {format(
                                    new Date(action.actionDate),
                                    "MMM dd, yyyy HH:mm"
                                  )}
                                </span>
                              </div>
                              {action.remarks && (
                                <div className="mt-1 flex items-start gap-2">
                                  <MessageSquare className="text-muted-foreground mt-0.5 h-3 w-3" />
                                  <span className="text-xs">
                                    {action.remarks}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Section for Pending Approvals */}
            {isPendingApproval && canTakeActionOnThisRequest && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Take Action</CardTitle>
                  <CardDescription>
                    Approve or reject this request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Remarks (Optional)
                    </label>
                    <Textarea
                      placeholder="Add any comments or remarks..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        handleAction(APPROVAL_ACTION_TYPES.APPROVED)
                      }
                      disabled={isProcessing}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        handleAction(APPROVAL_ACTION_TYPES.REJECTED)
                      }
                      disabled={isProcessing}
                      className="flex-1"
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Read-only for completed requests or non-approvers */}
            {(!isPendingApproval || !canTakeActionOnThisRequest) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request History</CardTitle>
                  <CardDescription>
                    All actions taken on this request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {requestDetail.actions?.map((action) => (
                      <div
                        key={action.actionId}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            action.actionTypeId ===
                            APPROVAL_ACTION_TYPES.APPROVED
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {action.actionTypeId ===
                          APPROVAL_ACTION_TYPES.APPROVED ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {action.actionByName}
                            </span>
                            <Badge
                              variant={
                                action.actionTypeId ===
                                APPROVAL_ACTION_TYPES.APPROVED
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {getActionTypeText(action.actionTypeId)}
                            </Badge>
                            <span className="text-muted-foreground text-sm">
                              Level {action.levelNumber}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-1 text-sm">
                            {format(
                              new Date(action.actionDate),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </div>
                          {action.remarks && (
                            <div className="bg-muted mt-2 rounded p-2 text-sm">
                              {action.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">Loading request details...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
