"use client"

import { useState } from "react"
import {
  ApprovalAction,
  ApprovalLevel,
  ApprovalRequest,
} from "@/interfaces/approval"
import { format, isValid } from "date-fns"
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface ApprovalRequestDetailProps {
  request: ApprovalRequest
  levels: ApprovalLevel[]
  actions: ApprovalAction[]
  currentUserId: number
  onApprove?: (requestId: number, comments: string) => Promise<void>
  onReject?: (requestId: number, comments: string) => Promise<void>
  onCancel?: () => void
}

export function ApprovalRequestDetail({
  request,
  levels,
  actions,
  currentUserId,
  onApprove,
  onReject,
  onCancel,
}: ApprovalRequestDetailProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current level info
  const currentLevel = levels.find(
    (level) => level.levelId === request.currentLevelId
  )

  // Check if current user can approve/reject
  const canApprove =
    currentLevel?.userRoleId === currentUserId && request.status === "Pending"

  // Get workflow steps
  const workflowSteps = levels
    .filter((level) => level.processId === request.processId)
    .sort((a, b) => a.levelNumber - b.levelNumber)

  // Get status for each step
  const getStepStatus = (level: ApprovalLevel) => {
    const levelActions = actions.filter(
      (action) => action.levelId === level.levelId
    )

    if (levelActions.length === 0) {
      if (level.levelId === request.currentLevelId) {
        return "current"
      }
      return "pending"
    }

    const lastAction = levelActions[levelActions.length - 1]
    return lastAction.actionType === "Approved" ? "approved" : "rejected"
  }

  const handleApprove = async () => {
    if (!onApprove) return
    setIsSubmitting(true)
    try {
      await onApprove(request.requestId, comments)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!onReject) return
    setIsSubmitting(true)
    try {
      await onReject(request.requestId, comments)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      case "Cancelled":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Request Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{request.referenceId}</CardTitle>
                <CardDescription>
                  Request Type:{" "}
                  {request.referenceId.includes("INV")
                    ? "AR Invoice"
                    : "General Request"}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={getStatusBadgeVariant(request.status)}
              className="text-sm"
            >
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Request Date</p>
                <p className="text-muted-foreground text-sm">
                  {request.requestedOn && isValid(new Date(request.requestedOn))
                    ? format(new Date(request.requestedOn), "dd/MM/yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Requested By</p>
                <p className="text-muted-foreground text-sm">
                  User {request.requestedBy}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Current Level</p>
                <p className="text-muted-foreground text-sm">
                  {currentLevel?.levelName || `Level ${request.currentLevelId}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Line */}
            <div className="bg-muted absolute top-6 right-0 left-0 h-0.5" />

            {/* Workflow Steps */}
            <div className="relative flex justify-between">
              {workflowSteps.map((level, index) => {
                const status = getStepStatus(level)
                const isLast = index === workflowSteps.length - 1

                return (
                  <div
                    key={level.levelId}
                    className="flex flex-col items-center"
                  >
                    {/* Step Circle */}
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        status === "approved"
                          ? "border-green-500 bg-green-500 text-white"
                          : status === "rejected"
                            ? "border-red-500 bg-red-500 text-white"
                            : status === "current"
                              ? "border-yellow-500 bg-yellow-500 text-white"
                              : "bg-muted border-muted text-muted-foreground"
                      } `}
                    >
                      {status === "approved" && (
                        <CheckCircle className="h-6 w-6" />
                      )}
                      {status === "rejected" && <XCircle className="h-6 w-6" />}
                      {status === "current" && <Clock className="h-6 w-6" />}
                      {status === "pending" && (
                        <span className="text-sm font-medium">
                          {level.levelNumber}
                        </span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="mt-2 max-w-32 text-center">
                      <p className="text-xs font-medium">{level.levelName}</p>
                      <p className="text-muted-foreground text-xs">
                        {status === "current"
                          ? "Awaiting approval"
                          : status === "approved"
                            ? "Approved"
                            : status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                      </p>
                    </div>

                    {/* Arrow (except for last item) */}
                    {!isLast && (
                      <div className="absolute top-6 left-full flex w-full justify-center">
                        <ArrowRight className="text-muted-foreground h-4 w-4" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Actions */}
      {canApprove && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Approval Decision
            </CardTitle>
            <CardDescription>
              You are the current approver for this request. Please review and
              provide your decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comments (Optional)</label>
              <Textarea
                placeholder="Add your comments here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={isSubmitting}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval History */}
      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actions
                .sort(
                  (a, b) =>
                    new Date(b.actionDate).getTime() -
                    new Date(a.actionDate).getTime()
                )
                .map((action) => {
                  const level = levels.find((l) => l.levelId === action.levelId)
                  return (
                    <div
                      key={action.actionId}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          action.actionType === "Approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        } `}
                      >
                        {action.actionType === "Approved" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {action.actionType}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            by User {action.actionById}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {action.actionDate &&
                            isValid(new Date(action.actionDate))
                              ? format(
                                  new Date(action.actionDate),
                                  "dd/MM/yyyy HH:mm"
                                )
                              : "N/A"}
                          </span>
                        </div>
                        {level && (
                          <p className="text-muted-foreground text-sm">
                            Level: {level.levelName}
                          </p>
                        )}
                        {action.comments && (
                          <p className="mt-1 text-sm">{action.comments}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    </div>
  )
}
