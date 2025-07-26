"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { IEmployee } from "@/interfaces/employee"
import { Leave, LeavePolicy } from "@/interfaces/leave"
import { toast } from "sonner"

import { useGetEmployees } from "@/hooks/use-employee"
import {
  useDeleteLeaveRequest,
  useGetLeaveBalances,
  useGetLeavePolicies,
  useGetLeaveRequests,
  useLeaveApprovalActions,
  useSaveLeavePolicy,
  useSaveLeaveRequest,
  useUpdateLeavePolicy,
  useUpdateLeaveRequest,
} from "@/hooks/use-leave"

import { LeaveDashboard } from "./components/leave-dashboard"

export default function LeavePage() {
  const params = useParams()
  const companyId = params.companyId as string

  // State for managing selected items
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null)

  // Fetch data using hooks
  const {
    data: leavesResponse,
    isLoading: leavesLoading,
    error: leavesError,
  } = useGetLeaveRequests()
  const { data: leaveBalancesResponse, isLoading: balancesLoading } =
    useGetLeaveBalances()
  const { data: policiesResponse, isLoading: policiesLoading } =
    useGetLeavePolicies()
  const { data: employeesResponse, isLoading: employeesLoading } =
    useGetEmployees()

  // Extract data from responses
  const leaves = leavesResponse?.data || []
  const leaveBalances = leaveBalancesResponse?.data || []
  const policies = policiesResponse?.data || []
  const employees = employeesResponse?.data || []

  // Mutations
  const saveLeaveMutation = useSaveLeaveRequest()
  const updateLeaveMutation = useUpdateLeaveRequest()
  const deleteLeaveMutation = useDeleteLeaveRequest()
  const savePolicyMutation = useSaveLeavePolicy()
  const updatePolicyMutation = useUpdateLeavePolicy()
  const { approveLeave, rejectLeave, isApproving, isRejecting } =
    useLeaveApprovalActions()

  // Handle leave form submission
  const handleLeaveSubmit = async (data: any) => {
    try {
      if (selectedLeave) {
        await updateLeaveMutation.mutateAsync({
          ...data,
          id: selectedLeave.id,
          companyId,
        })
        toast.success("Leave request updated successfully")
      } else {
        await saveLeaveMutation.mutateAsync({
          ...data,
          companyId,
        })
        toast.success("Leave request submitted successfully")
      }
      setSelectedLeave(null)
    } catch (error) {
      toast.error("Failed to submit leave request")
      console.error("Leave submission error:", error)
    }
  }

  // Handle policy form submission
  const handlePolicySubmit = async (data: any) => {
    try {
      if (selectedPolicy) {
        await updatePolicyMutation.mutateAsync({
          ...data,
          id: selectedPolicy.id,
          companyId,
        })
        toast.success("Leave policy updated successfully")
      } else {
        await savePolicyMutation.mutateAsync({
          ...data,
          companyId,
        })
        toast.success("Leave policy created successfully")
      }
      setSelectedPolicy(null)
    } catch (error) {
      toast.error("Failed to save leave policy")
      console.error("Policy submission error:", error)
    }
  }

  // Handle leave edit
  const handleLeaveEdit = (leave: Leave) => {
    setSelectedLeave(leave)
  }

  // Handle leave delete
  const handleLeaveDelete = async (leaveId: string) => {
    try {
      await deleteLeaveMutation.mutateAsync(leaveId)
      toast.success("Leave request deleted successfully")
    } catch (error) {
      toast.error("Failed to delete leave request")
      console.error("Leave deletion error:", error)
    }
  }

  // Handle leave approval
  const handleLeaveApprove = async (leaveId: string) => {
    try {
      await approveLeave(leaveId, "current-user-id", "Approved")
      toast.success("Leave request approved successfully")
    } catch (error) {
      toast.error("Failed to approve leave request")
      console.error("Leave approval error:", error)
    }
  }

  // Handle leave rejection
  const handleLeaveReject = async (leaveId: string) => {
    try {
      await rejectLeave(leaveId, "current-user-id", "Rejected")
      toast.success("Leave request rejected successfully")
    } catch (error) {
      toast.error("Failed to reject leave request")
      console.error("Leave rejection error:", error)
    }
  }

  // Handle policy edit
  const handlePolicyEdit = (policy: LeavePolicy) => {
    setSelectedPolicy(policy)
  }

  // Format employees data for the dashboard
  const formattedEmployees = employees.flat().map((emp: IEmployee) => ({
    id: emp.employeeId?.toString() || "",
    name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.code,
    employeeCode: emp.code || "",
    photo: emp.photo,
    department: emp.departmentName,
  }))

  // Show loading state
  if (leavesLoading || balancesLoading || policiesLoading || employeesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading leave management...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (leavesError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load leave data</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Dashboard */}
      <LeaveDashboard
        leaves={leaves.flat()}
        leaveBalances={leaveBalances.flat()}
        policies={policies.flat()}
        employees={formattedEmployees}
        onLeaveSubmit={handleLeaveSubmit}
        onLeaveEdit={handleLeaveEdit}
        onLeaveDelete={handleLeaveDelete}
        onLeaveApprove={handleLeaveApprove}
        onLeaveReject={handleLeaveReject}
        onPolicySubmit={handlePolicySubmit}
        onPolicyEdit={handlePolicyEdit}
      />

      {/* Loading States */}
      {(isApproving || isRejecting) && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">
              {isApproving
                ? "Approving leave request..."
                : "Rejecting leave request..."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
