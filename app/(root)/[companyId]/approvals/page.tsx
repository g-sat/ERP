"use client"

import { useEffect, useState } from "react"
import { APPROVAL_STATUS } from "@/interfaces/approval"
import { Clock, Eye } from "lucide-react"

import { useApproval } from "@/hooks/use-approval"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  } = useApproval()

  const [activeTab, setActiveTab] = useState("pending")
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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

  const pendingCount = requests.filter(
    (r) => r.statusTypeId === APPROVAL_STATUS.PENDING
  ).length
  const myRequestsCount = requests.length

  if (isLoading && requests.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">
            Manage approval requests and track their status
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            My Requests
            {myRequestsCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {myRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Requests waiting for your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalRequestTable
                requests={requests.filter(
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                My Requests
              </CardTitle>
              <CardDescription>
                Track the status of your submitted requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalRequestTable
                requests={requests}
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
