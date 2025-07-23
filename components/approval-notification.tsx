"use client"

import { useEffect, useState } from "react"
import { APPROVAL_STATUS, IApprovalRequest } from "@/interfaces/approval"
import { Bell, CheckCircle, Clock, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ApprovalNotificationProps {
  request: IApprovalRequest
  onView?: () => void
  onDismiss?: () => void
  autoHide?: boolean
  hideDelay?: number
}

export function ApprovalNotification({
  request,
  onView,
  onDismiss,
  autoHide = false,
  hideDelay = 5000,
}: ApprovalNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoHide && hideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, hideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, hideDelay, onDismiss])

  if (!isVisible) return null

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case APPROVAL_STATUS.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case APPROVAL_STATUS.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />
      case APPROVAL_STATUS.PENDING:
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusText = (statusId: number) => {
    switch (statusId) {
      case APPROVAL_STATUS.APPROVED:
        return "Approved"
      case APPROVAL_STATUS.REJECTED:
        return "Rejected"
      case APPROVAL_STATUS.PENDING:
        return "Pending Approval"
      default:
        return "Status Updated"
    }
  }

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case APPROVAL_STATUS.APPROVED:
        return "border-green-200 bg-green-50"
      case APPROVAL_STATUS.REJECTED:
        return "border-red-200 bg-red-50"
      case APPROVAL_STATUS.PENDING:
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <Card className={`border-l-4 ${getStatusColor(request.statusTypeId)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(request.statusTypeId)}
            <CardTitle className="text-sm">
              {getStatusText(request.statusTypeId)}
            </CardTitle>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm">
          <strong>{request.referenceId}</strong> - {request.processName}
        </CardDescription>
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Level {request.currentLevelNumber || "N/A"}
          </Badge>
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="text-xs"
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
