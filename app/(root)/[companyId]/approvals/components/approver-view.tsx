"use client"

import { useState } from "react"
import { ApprovalLevel, ApprovalRequest } from "@/interfaces/approval"
import { format, isValid } from "date-fns"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ApproverViewProps {
  requests: ApprovalRequest[]
  levels: ApprovalLevel[]
  currentUserId: number
  isLoading?: boolean
  onViewRequest?: (request: ApprovalRequest) => void
  onRefresh?: () => void
  onFilterChange?: (search: string) => void
}

export function ApproverView({
  requests,
  levels,
  currentUserId,
  isLoading = false,
  onViewRequest,
  onRefresh,
  onFilterChange,
}: ApproverViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange?.(query)
  }

  // Filter requests that the current user can approve
  const getApprovableRequests = () => {
    return requests.filter((request) => {
      if (request.status !== "Pending") return false
      const currentLevel = levels.find(
        (level) => level.levelId === request.currentLevelId
      )
      return currentLevel?.userRoleId === currentUserId
    })
  }

  const approvableRequests = getApprovableRequests()

  const getCurrentLevelName = (request: ApprovalRequest) => {
    const level = levels.find((l) => l.levelId === request.currentLevelId)
    return level?.levelName || `Level ${request.currentLevelId}`
  }

  const getRequestType = (referenceId: string) => {
    if (referenceId.includes("INV")) return "AR Invoice"
    if (referenceId.includes("PO")) return "Purchase Order"
    if (referenceId.includes("EXP")) return "Expense"
    return "General Request"
  }

  const getUrgencyBadge = (requestDate: string | Date) => {
    const requestTime = new Date(requestDate).getTime()
    const now = new Date().getTime()
    const daysDiff = (now - requestTime) / (1000 * 60 * 60 * 24)

    if (daysDiff > 7)
      return (
        <Badge variant="destructive" className="text-xs">
          Overdue
        </Badge>
      )
    if (daysDiff > 3)
      return (
        <Badge variant="secondary" className="text-xs">
          Urgent
        </Badge>
      )
    return (
      <Badge variant="outline" className="text-xs">
        New
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="bg-muted h-9 w-24 animate-pulse rounded" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-muted h-16 animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Pending Approvals
          </h2>
          <p className="text-muted-foreground">
            Review and approve requests awaiting your decision
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Pending Approvals Cards */}
      <div className="space-y-4">
        {approvableRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-medium">No Pending Approvals</h3>
              <p className="text-muted-foreground text-center">
                All requests have been processed
              </p>
            </CardContent>
          </Card>
        ) : (
          approvableRequests.map((request) => (
            <Card
              key={request.requestId}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - Request Details */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">
                        {getRequestType(request.referenceId)}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {request.referenceId}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <span>By: User {request.requestedBy}</span>
                        <span>
                          {request.requestedOn &&
                          isValid(new Date(request.requestedOn))
                            ? format(
                                new Date(request.requestedOn),
                                "dd/MM/yyyy"
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status and Actions */}
                  <div className="flex items-center gap-4">
                    {request.requestedOn &&
                      getUrgencyBadge(request.requestedOn)}
                    {onViewRequest && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onViewRequest(request)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="text-muted-foreground mb-2 flex items-center justify-between text-sm">
                    <span>Current Level: {getCurrentLevelName(request)}</span>
                    <span>Awaiting Your Approval</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvableRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                approvableRequests.filter((r) => {
                  const daysDiff =
                    (new Date().getTime() - new Date(r.requestedOn).getTime()) /
                    (1000 * 60 * 60 * 24)
                  return daysDiff <= 3
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                approvableRequests.filter((r) => {
                  const daysDiff =
                    (new Date().getTime() - new Date(r.requestedOn).getTime()) /
                    (1000 * 60 * 60 * 24)
                  return daysDiff > 3 && daysDiff <= 7
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                approvableRequests.filter((r) => {
                  const daysDiff =
                    (new Date().getTime() - new Date(r.requestedOn).getTime()) /
                    (1000 * 60 * 60 * 24)
                  return daysDiff > 7
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
