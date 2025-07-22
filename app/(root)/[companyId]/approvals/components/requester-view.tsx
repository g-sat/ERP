"use client"

import { useState } from "react"
import { ApprovalLevel, ApprovalRequest } from "@/interfaces/approval"
import { format, isValid } from "date-fns"
import {
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

interface RequesterViewProps {
  requests: ApprovalRequest[]
  levels: ApprovalLevel[]
  isLoading?: boolean
  onViewRequest?: (request: ApprovalRequest) => void
  onRefresh?: () => void
  onFilterChange?: (search: string) => void
}

export function RequesterView({
  requests,
  levels,
  isLoading = false,
  onViewRequest,
  onRefresh,
  onFilterChange,
}: RequesterViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange?.(query)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="bg-muted h-9 w-24 animate-pulse rounded" />
            <div className="bg-muted h-9 w-32 animate-pulse rounded" />
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
          <h2 className="text-2xl font-bold tracking-tight">My Requests</h2>
          <p className="text-muted-foreground">
            Track the status of your submitted approval requests
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

      {/* Requests Cards */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">No Requests Found</h3>
              <p className="text-muted-foreground text-center">
                You haven&apos;t submitted any approval requests yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card
              key={request.requestId}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - Request Details */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">
                        {getRequestType(request.referenceId)}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {request.referenceId}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {request.requestedOn &&
                        isValid(new Date(request.requestedOn))
                          ? format(new Date(request.requestedOn), "dd/MM/yyyy")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Right Section - Status and Actions */}
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className="text-sm"
                    >
                      {request.status}
                    </Badge>
                    {onViewRequest && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRequest(request)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="text-muted-foreground mb-2 flex items-center justify-between text-sm">
                    <span>Current Level: {getCurrentLevelName(request)}</span>
                    <span>Progress</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        request.status === "Approved"
                          ? "bg-green-500"
                          : request.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                      style={{
                        width:
                          request.status === "Approved"
                            ? "100%"
                            : request.status === "Rejected"
                              ? "100%"
                              : "50%",
                      }}
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
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === "Approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter((r) => r.status === "Rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
