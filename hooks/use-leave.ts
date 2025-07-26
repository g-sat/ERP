import {
  Leave,
  LeaveApproval,
  LeaveBalance,
  LeaveBalanceFormData,
  LeaveFilter,
  LeaveFormData,
  LeavePolicy,
  LeavePolicyFormData,
  LeaveReport,
  LeaveRequest,
  LeaveSettings,
  LeaveSettingsFormData,
  LeaveSummary,
} from "@/interfaces/leave"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { HrLeaveApproval, HrLeaveRequest } from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  useSave,
  useUpdate,
} from "@/hooks/use-common"

// Hook for fetching leave requests
export function useGetLeaveRequests(filters?: string) {
  return useGet<Leave[]>(HrLeaveRequest.get, "leave-requests", filters)
}

// Hook for fetching leave request by ID
export function useGetLeaveRequestById(leaveId: string | undefined) {
  return useGetById<Leave>(
    HrLeaveRequest.getById,
    "leave-request",
    leaveId || "",
    {
      enabled: !!leaveId && leaveId !== "0",
    }
  )
}

// Hook for fetching leave requests by employee
export function useGetLeaveRequestsByEmployee(employeeId: string | undefined) {
  return useGetByParams<Leave[]>(
    HrLeaveRequest.get,
    "leave-requests-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
    }
  )
}

// Hook for saving leave request
export function useSaveLeaveRequest() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<Leave>(HrLeaveRequest.post)

  return {
    ...saveMutation,
    mutate: (data: LeaveFormData) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
          }
        },
      })
    },
  }
}

// Hook for updating leave request
export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<Leave>(HrLeaveRequest.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<Leave>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({ queryKey: ["leave-request"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave request
export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveRequest.delete)

  return {
    ...deleteMutation,
    mutate: (leaveId: string) => {
      deleteMutation.mutate(leaveId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
          }
        },
      })
    },
  }
}

// Hook for fetching leave approvals
export function useGetLeaveApprovals(filters?: string) {
  return useGet<LeaveApproval[]>(
    HrLeaveApproval.get,
    "leave-approvals",
    filters
  )
}

// Hook for fetching leave approval by ID
export function useGetLeaveApprovalById(approvalId: string | undefined) {
  return useGetById<LeaveApproval>(
    HrLeaveApproval.getById,
    "leave-approval",
    approvalId || "",
    {
      enabled: !!approvalId && approvalId !== "0",
    }
  )
}

// Hook for fetching leave approvals by request
export function useGetLeaveApprovalsByRequest(leaveId: string | undefined) {
  return useGetByParams<LeaveApproval[]>(
    HrLeaveApproval.get,
    "leave-approvals-by-request",
    leaveId || "",
    {
      enabled: !!leaveId && leaveId.trim() !== "",
    }
  )
}

// Hook for saving leave approval
export function useSaveLeaveApproval() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<LeaveApproval>(HrLeaveApproval.post)

  return {
    ...saveMutation,
    mutate: (data: Partial<LeaveApproval>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
          }
        },
      })
    },
  }
}

// Hook for updating leave approval
export function useUpdateLeaveApproval() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<LeaveApproval>(HrLeaveApproval.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<LeaveApproval>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({ queryKey: ["leave-approval"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
          }
        },
      })
    },
  }
}

// Hook for deleting leave approval
export function useDeleteLeaveApproval() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveApproval.delete)

  return {
    ...deleteMutation,
    mutate: (approvalId: string) => {
      deleteMutation.mutate(approvalId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
          }
        },
      })
    },
  }
}

// Hook for fetching leave policies
export function useGetLeavePolicies(filters?: string) {
  return useGet<LeavePolicy[]>(HrLeaveRequest.get, "leave-policies", filters)
}

// Hook for fetching leave policy by ID
export function useGetLeavePolicyById(policyId: string | undefined) {
  return useGetById<LeavePolicy>(
    HrLeaveRequest.getById,
    "leave-policy",
    policyId || "",
    {
      enabled: !!policyId && policyId !== "0",
    }
  )
}

// Hook for saving leave policy
export function useSaveLeavePolicy() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<LeavePolicy>(HrLeaveRequest.post)

  return {
    ...saveMutation,
    mutate: (data: LeavePolicyFormData) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-policies"] })
          }
        },
      })
    },
  }
}

// Hook for updating leave policy
export function useUpdateLeavePolicy() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<LeavePolicy>(HrLeaveRequest.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<LeavePolicy>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-policies"] })
            queryClient.invalidateQueries({ queryKey: ["leave-policy"] })
          }
        },
      })
    },
  }
}

// Hook for deleting leave policy
export function useDeleteLeavePolicy() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveRequest.delete)

  return {
    ...deleteMutation,
    mutate: (policyId: string) => {
      deleteMutation.mutate(policyId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-policies"] })
          }
        },
      })
    },
  }
}

// Hook for fetching leave balances
export function useGetLeaveBalances(filters?: string) {
  return useGet<LeaveBalance[]>(HrLeaveRequest.get, "leave-balances", filters)
}

// Hook for fetching leave balance by employee
export function useGetLeaveBalanceByEmployee(employeeId: string | undefined) {
  return useGetByParams<LeaveBalance[]>(
    HrLeaveRequest.get,
    "leave-balances-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
    }
  )
}

// Hook for saving leave balance
export function useSaveLeaveBalance() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<LeaveBalance>(HrLeaveRequest.post)

  return {
    ...saveMutation,
    mutate: (data: LeaveBalanceFormData) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-balances-by-employee"],
            })
          }
        },
      })
    },
  }
}

// Hook for updating leave balance
export function useUpdateLeaveBalance() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<LeaveBalance>(HrLeaveRequest.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<LeaveBalance>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-balances-by-employee"],
            })
          }
        },
      })
    },
  }
}

// Hook for fetching leave settings
export function useGetLeaveSettings(companyId: string | undefined) {
  return useGetByParams<LeaveSettings>(
    HrLeaveRequest.get,
    "leave-settings",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for saving leave settings
export function useSaveLeaveSettings() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<LeaveSettings>(HrLeaveRequest.post)

  return {
    ...saveMutation,
    mutate: (data: LeaveSettingsFormData) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
          }
        },
      })
    },
  }
}

// Hook for updating leave settings
export function useUpdateLeaveSettings() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<LeaveSettings>(HrLeaveRequest.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<LeaveSettings>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
          }
        },
      })
    },
  }
}

// Hook for fetching leave summary
export function useGetLeaveSummary(filters?: string) {
  return useGet<LeaveSummary[]>(HrLeaveRequest.get, "leave-summary", filters)
}

// Hook for fetching leave reports
export function useGetLeaveReports(filters?: string) {
  return useGet<LeaveReport[]>(HrLeaveRequest.get, "leave-reports", filters)
}

// Hook for leave approval actions
export function useLeaveApprovalActions() {
  const queryClient = useQueryClient()
  const approveMutation = useUpdate<Leave>(HrLeaveRequest.put)
  const rejectMutation = useUpdate<Leave>(HrLeaveRequest.put)

  const approveLeave = (
    leaveId: string,
    approverId: string,
    comments?: string
  ) => {
    approveMutation.mutate(
      {
        id: leaveId,
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
        notes: comments,
      },
      {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({ queryKey: ["leave-request"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
          }
        },
      }
    )
  }

  const rejectLeave = (
    leaveId: string,
    rejectorId: string,
    rejectionReason: string
  ) => {
    rejectMutation.mutate(
      {
        id: leaveId,
        status: "REJECTED",
        rejectedBy: rejectorId,
        rejectedAt: new Date().toISOString(),
        rejectionReason,
      },
      {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({ queryKey: ["leave-request"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
          }
        },
      }
    )
  }

  return {
    approveLeave,
    rejectLeave,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  }
}

// Hook for leave statistics
export function useLeaveStatistics(companyId: string | undefined) {
  return useGetByParams<{
    totalLeaves: number
    pendingLeaves: number
    approvedLeaves: number
    rejectedLeaves: number
    totalEmployees: number
    employeesOnLeave: number
  }>(HrLeaveRequest.get, "leave-statistics", companyId || "", {
    enabled: !!companyId && companyId.trim() !== "",
  })
}
