"use client"

import { useState } from "react"
import { ILeave } from "@/interfaces/leave"
import { LeaveRequestFormValues } from "@/schemas/leave"
import { useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { HrUserRequest } from "@/lib/api-routes"
import { useGetById, usePersist } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { LeaveRequestForm } from "./components/leave-request-form"
import { LeaveRequestTable } from "./components/leave-request-table"

export default function LeavePage() {
  const queryClient = useQueryClient()
  const [showRequestForm, setShowRequestForm] = useState(false)

  // Fetch leave data
  const { data: leavesData, isLoading: leavesLoading } = useGetById<ILeave>(
    HrUserRequest.get,
    "leaves",
    "33"
  )

  // Initialize mutation hook
  const saveLeaveRequestMutation = usePersist(HrUserRequest.add)

  // Extract data
  const leaves = leavesData?.data || []

  // Calculate statistics for current year
  const currentYear = new Date().getFullYear()
  const currentYearLeaves = leaves.filter((leave) => {
    const leaveYear = new Date(leave.startDate).getFullYear()
    return leaveYear === currentYear
  })

  const totalRequests = leaves.length
  const totalLeaveBalance = 25 // Default annual leave balance
  const totalLeavePerYear = currentYearLeaves.reduce(
    (total, leave) => total + leave.totalDays,
    0
  )

  const handleAddNewRequest = () => {
    setShowRequestForm(true)
  }

  const handleLeaveSubmit = async (data: LeaveRequestFormValues) => {
    try {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      const totalDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

      const leaveRequestData = {
        employeeId: "33",
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays,
        reason: data.reason,
        statusId: 1,
        remarks: data.remarks,
        attachments: data.attachments,
      }

      await saveLeaveRequestMutation.mutateAsync(leaveRequestData)
      setShowRequestForm(false)
      toast.success("Leave request submitted successfully")
      queryClient.invalidateQueries({ queryKey: ["leaves"] })
    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast.error("Failed to submit leave request")
    }
  }

  // Show loading state
  if (leavesLoading && leaves.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="text-muted-foreground mt-2">Loading leave data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leave Dashboard</h2>
        <Button onClick={handleAddNewRequest}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-muted-foreground text-xs">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeaveBalance}</div>
            <p className="text-muted-foreground text-xs">Days per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Used This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeavePerYear}</div>
            <p className="text-muted-foreground text-xs">{currentYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardContent>
          <LeaveRequestTable
            leaves={leaves}
            onSave={() => {}}
            showActions={false}
          />
        </CardContent>
      </Card>

      {/* Leave Request Form Dialog */}
      <LeaveRequestForm
        open={showRequestForm}
        onOpenChange={setShowRequestForm}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  )
}
