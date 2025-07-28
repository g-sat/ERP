"use client"

import { useEffect, useState } from "react"
import { APPROVAL_STATUS } from "@/interfaces/approval"
import {
  AlertCircle,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react"

import { useApproval } from "@/hooks/use-approval"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    fetchApprovalCounts,
  } = useApproval()

  const [activeTab, setActiveTab] = useState("pending")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [processFilter, setProcessFilter] = useState<string>("all")

  // State for counts
  const [pendingCount, setPendingCount] = useState(0)
  const [myRequestsCount, setMyRequestsCount] = useState(0)

  // Fetch counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      const counts = await fetchApprovalCounts()
      if (counts) {
        setPendingCount(counts.pendingCount)
        setMyRequestsCount(counts.myRequestsCount)
      }
    }

    fetchCounts()
  }, [fetchApprovalCounts])

  // Fetch data when tab changes (for the main requests state)
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

  const handleRefresh = async () => {
    // Refresh both counts and current tab data
    const counts = await fetchApprovalCounts()
    if (counts) {
      setPendingCount(counts.pendingCount)
      setMyRequestsCount(counts.myRequestsCount)
    }

    if (activeTab === "pending") {
      fetchPendingApprovals()
    } else {
      fetchMyRequests()
    }
  }

  // Filter requests based on search and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.processName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        request.statusId === APPROVAL_STATUS.PENDING) ||
      (statusFilter === "approved" &&
        request.statusId === APPROVAL_STATUS.APPROVED) ||
      (statusFilter === "rejected" &&
        request.statusId === APPROVAL_STATUS.REJECTED)

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
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Approvals</h1>
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

      {/* Simple Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">My Requests</p>
                <p className="text-2xl font-bold text-blue-600">
                  {myRequestsCount}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-2xl font-bold">
                  {pendingCount + myRequestsCount}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            My Requests
            {myRequestsCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {myRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Simple Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={processFilter} onValueChange={setProcessFilter}>
              <SelectTrigger className="w-[140px]">
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

        {/* Tab Content */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalRequestTable
                requests={filteredRequests.filter(
                  (r) => r.statusId === APPROVAL_STATUS.PENDING
                )}
                onViewDetail={handleViewDetail}
                showActions={true}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                My Requests
              </CardTitle>
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
