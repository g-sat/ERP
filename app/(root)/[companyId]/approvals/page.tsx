"use client"

import { useEffect, useState } from "react"
import { APPROVAL_STATUS } from "@/interfaces/approval"
import {
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSkeleton } from "@/components/loading-skeleton"

import { ApprovalDashboard } from "./components/approval-dashboard"
import { ApprovalDetailDialog } from "./components/approval-detail-dialog"
import { ApprovalRequestTable } from "./components/approval-request-table"

export default function ApprovalsPage() {
  const {
    requests,
    requestDetail,
    isLoading,
    error,
    fetchMyRequests,
    fetchPendingApprovals,
    fetchRequestDetail,
  } = useApproval()

  const [activeTab, setActiveTab] = useState("pending")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [processFilter, setProcessFilter] = useState<string>("all")

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingApprovals()
    } else {
      fetchMyRequests()
    }
  }, [activeTab, fetchPendingApprovals, fetchMyRequests])

  const handleViewDetail = async (requestId: number) => {
    await fetchRequestDetail(requestId)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
  }

  const handleRefresh = () => {
    if (activeTab === "pending") {
      fetchPendingApprovals()
    } else {
      fetchMyRequests()
    }
  }

  const pendingCount = requests.filter(
    (r) => r.statusTypeId === APPROVAL_STATUS.PENDING
  ).length
  const myRequestsCount = requests.length

  // Filter requests based on search and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.processName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        request.statusTypeId === APPROVAL_STATUS.PENDING) ||
      (statusFilter === "approved" &&
        request.statusTypeId === APPROVAL_STATUS.APPROVED) ||
      (statusFilter === "rejected" &&
        request.statusTypeId === APPROVAL_STATUS.REJECTED)

    const matchesProcess =
      processFilter === "all" || request.processName === processFilter

    return matchesSearch && matchesStatus && matchesProcess
  })

  // Get unique process names for filter
  const processNames = [
    ...new Set(requests.map((r) => r.processName).filter(Boolean)),
  ]

  if (isLoading && requests.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Approvals Center
          </h1>
          <p className="text-muted-foreground">
            Manage and track approval requests across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <ApprovalDashboard requests={requests} />

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              <p className="text-destructive font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            My Requests
            {myRequestsCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                {myRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Filters Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by reference, process, or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={processFilter} onValueChange={setProcessFilter}>
              <SelectTrigger className="w-[160px]">
                <FileText className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Process" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Processes</SelectItem>
                {processNames.map((process) => (
                  <SelectItem key={process} value={process || ""}>
                    {process}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Requests waiting for your approval decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalRequestTable
                requests={filteredRequests.filter(
                  (r) => r.statusTypeId === APPROVAL_STATUS.PENDING
                )}
                onViewDetail={handleViewDetail}
                showActions={true}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                My Requests
              </CardTitle>
              <CardDescription>
                Track the status and progress of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalRequestTable
                requests={filteredRequests}
                onViewDetail={handleViewDetail}
                showActions={false}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApprovalDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        requestDetail={requestDetail}
        onClose={handleCloseDetail}
        isPendingApproval={activeTab === "pending"}
      />
    </div>
  )
}
