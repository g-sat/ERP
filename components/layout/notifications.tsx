"use client"

import { NotificationType } from "@/interfaces/notification"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, Clock, Trash2, X } from "lucide-react"

import { useApprovalCounts } from "@/hooks/use-approval"
import { useNotifications } from "@/hooks/use-notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "document_expiry":
      return "📄"
    case "task_reminder":
      return "✅"
    case "system_update":
      return "🔧"
    case "invoice_alert":
      return "💰"
    case "payment_reminder":
      return "💳"
    case "security_alert":
      return "🔒"
    case "approval_request":
      return "👤"
    case "report_ready":
      return "📊"
    case "maintenance_scheduled":
      return "🛠️"
    default:
      return "🔔"
  }
}

export function Notifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
    sendTestNotification,
  } = useNotifications()

  const { pendingCount: approvalCount, refreshCounts } = useApprovalCounts()

  // Calculate total count (general notifications + approval count)
  const totalCount = unreadCount + approvalCount

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  const handleRefreshApprovals = async () => {
    await refreshCounts()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative size-8">
          <Bell
            className={`h-5 w-5 ${totalCount > 0 ? "animate-pulse" : ""}`}
          />
          {totalCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 animate-bounce items-center justify-center rounded-full text-[10px] font-medium">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-6 px-2 text-xs"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshApprovals}
              className="h-6 px-2 text-xs"
            >
              <Clock className="mr-1 h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Approval Count Summary */}
        {approvalCount > 0 && (
          <div className="border-b bg-yellow-50/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Pending Approvals
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {approvalCount}
              </Badge>
            </div>
          </div>
        )}

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="text-muted-foreground p-4 text-center">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="hover:bg-accent flex cursor-pointer flex-col items-start gap-1 p-3"
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex w-full items-start justify-between">
                    <div className="flex flex-1 items-start gap-2">
                      <span className="mt-0.5 text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm leading-tight font-medium">
                          {notification.title}
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs leading-relaxed">
                          {notification.body}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(
                              new Date(notification.createdDate || Date.now()),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                          {notification.status === "delivered" && (
                            <Badge
                              variant="secondary"
                              className="px-1 py-0 text-xs"
                            >
                              New
                            </Badge>
                          )}
                          {notification.navigation && (
                            <Badge
                              variant="outline"
                              className="px-1 py-0 text-xs"
                            >
                              {notification.navigation.type === "page"
                                ? "📄"
                                : "💬"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) =>
                        handleDeleteNotification(e, notification.id)
                      }
                      className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            className="w-full text-xs"
          >
            Send Test Notification
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
