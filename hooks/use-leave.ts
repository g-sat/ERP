import {
  ILeave,
  ILeaveBalance,
  ILeavePolicy,
  ILeaveRequest,
} from "@/interfaces/leave"
import { useQueryClient } from "@tanstack/react-query"

import {
  HrLeaveApproval,
  HrLeaveBalance,
  HrLeavePolicy,
  HrLeaveRequest,
} from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"

// ===== LEAVE MANAGEMENT HOOKS =====

// Hook for fetching all leaves
export function useGetLeaves(filters?: string) {
  return useGet<ILeave>(HrLeaveRequest.get, "leaves", filters)
}

// Hook for fetching leave by ID
export function useGetLeaveById(leaveId: string | undefined) {
  return useGetById<ILeave>(HrLeaveRequest.getById, "leave", leaveId || "", {
    enabled: !!leaveId && leaveId !== "0",
    queryKey: ["leave", leaveId],
  })
}

// Hook for fetching leaves by employee
export function useGetLeavesByEmployee(employeeId: string | undefined) {
  return useGetByParams<ILeave>(
    HrLeaveRequest.getByEmployee,
    "leaves-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
      queryKey: ["leaves-by-employee", employeeId],
    }
  )
}

// Hook for fetching leaves by department
export function useGetLeavesByDepartment(departmentId: string | undefined) {
  return useGetByParams<ILeave>(
    HrLeaveRequest.getByDepartment,
    "leaves-by-department",
    departmentId || "",
    {
      enabled: !!departmentId && departmentId.trim() !== "",
      queryKey: ["leaves-by-department", departmentId],
    }
  )
}

// Hook for fetching leaves by status
export function useGetLeavesByStatus(status: string | undefined) {
  return useGetByParams<ILeave>(
    HrLeaveRequest.getByStatus,
    "leaves-by-status",
    status || "",
    {
      enabled: !!status && status.trim() !== "",
      queryKey: ["leaves-by-status", status],
    }
  )
}

// Hook for fetching leaves by date range
export function useGetLeavesByDateRange(startDate: string, endDate: string) {
  return useGetByParams<ILeave>(
    HrLeaveRequest.getByDateRange,
    "leaves-by-date-range",
    `${startDate}/${endDate}`,
    {
      enabled: !!startDate && !!endDate,
      queryKey: ["leaves-by-date-range", startDate, endDate],
    }
  )
}

// Hook for saving leave
export function useSaveLeave() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<ILeave>(HrLeaveRequest.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<ILeave>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leaves"] })
            queryClient.invalidateQueries({ queryKey: ["leaves-by-employee"] })
            queryClient.invalidateQueries({
              queryKey: ["leaves-by-department"],
            })
            queryClient.invalidateQueries({ queryKey: ["leaves-by-status"] })
          }
        },
      })
    },
  }
}

// Hook for updating leave
export function useUpdateLeave() {
  const queryClient = useQueryClient()
  const updateMutation = usePersist<ILeave>(HrLeaveRequest.add)

  return {
    ...updateMutation,
    mutate: (data: Partial<ILeave>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leaves"] })
            queryClient.invalidateQueries({ queryKey: ["leave"] })
            queryClient.invalidateQueries({ queryKey: ["leaves-by-employee"] })
            queryClient.invalidateQueries({
              queryKey: ["leaves-by-department"],
            })
            queryClient.invalidateQueries({ queryKey: ["leaves-by-status"] })
          }
        },
      })
    },
  }
}

// Hook for deleting leave
export function useDeleteLeave() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveRequest.delete)

  return {
    ...deleteMutation,
    mutate: (leaveId: string) => {
      deleteMutation.mutate(leaveId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leaves"] })
            queryClient.invalidateQueries({ queryKey: ["leaves-by-employee"] })
            queryClient.invalidateQueries({
              queryKey: ["leaves-by-department"],
            })
            queryClient.invalidateQueries({ queryKey: ["leaves-by-status"] })
          }
        },
      })
    },
  }
}

// ===== LEAVE BALANCE HOOKS =====

// Hook for fetching leave balances
export function useGetLeaveBalances(filters?: string) {
  return useGet<ILeaveBalance>(HrLeaveBalance.get, "leave-balances", filters)
}

// Hook for fetching leave balance by ID
export function useGetLeaveBalanceById(balanceId: string | undefined) {
  return useGetById<ILeaveBalance>(
    HrLeaveBalance.getById,
    "leave-balance",
    balanceId || "",
    {
      enabled: !!balanceId && balanceId !== "0",
      queryKey: ["leave-balance", balanceId],
    }
  )
}

// Hook for fetching leave balances by employee
export function useGetLeaveBalancesByEmployee(employeeId: string | undefined) {
  return useGetByParams<ILeaveBalance>(
    HrLeaveBalance.getByEmployee,
    "leave-balances-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
      queryKey: ["leave-balances-by-employee", employeeId],
    }
  )
}

// Hook for saving leave balance
export function useSaveLeaveBalance() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<ILeaveBalance>(HrLeaveBalance.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<ILeaveBalance>) => {
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
  const updateMutation = usePersist<ILeaveBalance>(HrLeaveBalance.update)

  return {
    ...updateMutation,
    mutate: (data: Partial<ILeaveBalance>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-balances"] })
            queryClient.invalidateQueries({ queryKey: ["leave-balance"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-balances-by-employee"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave balance
export function useDeleteLeaveBalance() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveBalance.delete)

  return {
    ...deleteMutation,
    mutate: (balanceId: string) => {
      deleteMutation.mutate(balanceId, {
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

// Hook for bulk updating leave balances
export function useBulkUpdateLeaveBalances() {
  const queryClient = useQueryClient()
  const bulkUpdateMutation = usePersist<ILeaveBalance[]>(
    HrLeaveBalance.bulkUpdate
  )

  return {
    ...bulkUpdateMutation,
    mutate: (data: ILeaveBalance[]) => {
      bulkUpdateMutation.mutate(data, {
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

// Hook for resetting yearly leave balances
export function useResetYearlyLeaveBalances() {
  const queryClient = useQueryClient()
  const resetMutation = usePersist<{ year: number; companyId: string }>(
    HrLeaveBalance.resetYearly
  )

  return {
    ...resetMutation,
    mutate: (data: { year: number; companyId: string }) => {
      resetMutation.mutate(data, {
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

// Hook for fetching leave balance summary
export function useGetLeaveBalanceSummary(filters?: string) {
  return useGet<ILeaveBalance>(
    HrLeaveBalance.summary,
    "leave-balance-summary",
    filters
  )
}

// ===== LEAVE POLICY HOOKS =====

// Hook for fetching leave policies
export function useGetLeavePolicies(filters?: string) {
  return useGet<ILeavePolicy>(HrLeavePolicy.get, "leave-policies", filters)
}

// Hook for fetching leave policy by ID
export function useGetLeavePolicyById(policyId: string | undefined) {
  return useGetById<ILeavePolicy>(
    HrLeavePolicy.getById,
    "leave-policy",
    policyId || "",
    {
      enabled: !!policyId && policyId !== "0",
      queryKey: ["leave-policy", policyId],
    }
  )
}

// Hook for saving leave policy
export function useSaveLeavePolicy() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<ILeavePolicy>(HrLeavePolicy.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<ILeavePolicy>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-policies"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-policies-by-company"],
            })
            queryClient.invalidateQueries({
              queryKey: ["active-leave-policies"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave policy
export function useDeleteLeavePolicy() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeavePolicy.delete)

  return {
    ...deleteMutation,
    mutate: (policyId: string) => {
      deleteMutation.mutate(policyId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-policies"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-policies-by-company"],
            })
            queryClient.invalidateQueries({
              queryKey: ["active-leave-policies"],
            })
          }
        },
      })
    },
  }
}

// ===== LEAVE REQUEST HOOKS =====

// Hook for fetching leave requests
export function useGetLeaveRequests(filters?: string) {
  return useGet<ILeaveRequest>(HrLeaveRequest.get, "leave-requests", filters)
}

// Hook for fetching leave request by ID
export function useGetLeaveRequestById(requestId: string | undefined) {
  return useGetById<ILeaveRequest>(
    HrLeaveRequest.getById,
    "leave-request",
    requestId || "",
    {
      enabled: !!requestId && requestId !== "0",
      queryKey: ["leave-request", requestId],
    }
  )
}

// Hook for fetching leave requests by employee
export function useGetLeaveRequestsByEmployee(employeeId: string | undefined) {
  return useGetByParams<ILeaveRequest>(
    HrLeaveRequest.getByEmployee,
    "leave-requests-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
      queryKey: ["leave-requests-by-employee", employeeId],
    }
  )
}

// Hook for fetching leave requests by status
export function useGetLeaveRequestsByStatus(status: string | undefined) {
  return useGetByParams<ILeaveRequest>(
    HrLeaveRequest.getByStatus,
    "leave-requests-by-status",
    status || "",
    {
      enabled: !!status && status.trim() !== "",
      queryKey: ["leave-requests-by-status", status],
    }
  )
}

// Hook for fetching pending leave requests
export function useGetPendingLeaveRequests() {
  return useGet<ILeaveRequest>(
    HrLeaveRequest.getPending,
    "pending-leave-requests"
  )
}

// Hook for fetching approved leave requests
export function useGetApprovedLeaveRequests() {
  return useGet<ILeaveRequest>(
    HrLeaveRequest.getApproved,
    "approved-leave-requests"
  )
}

// Hook for fetching rejected leave requests
export function useGetRejectedLeaveRequests() {
  return useGet<ILeaveRequest>(
    HrLeaveRequest.getRejected,
    "rejected-leave-requests"
  )
}

// Hook for saving leave request
export function useSaveLeaveRequest() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<ILeaveRequest>(HrLeaveRequest.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<ILeaveRequest>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-status"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["approved-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["rejected-leave-requests"],
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
  const updateMutation = usePersist<ILeaveRequest>(HrLeaveRequest.update)

  return {
    ...updateMutation,
    mutate: (data: Partial<ILeaveRequest>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({ queryKey: ["leave-request"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-status"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["approved-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["rejected-leave-requests"],
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
    mutate: (requestId: string) => {
      deleteMutation.mutate(requestId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-requests-by-status"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["approved-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["rejected-leave-requests"],
            })
          }
        },
      })
    },
  }
}

// ===== LEAVE APPROVAL HOOKS =====

// Hook for fetching leave approvals
export function useGetLeaveApprovals(filters?: string) {
  return useGet<ILeaveRequest[]>(
    HrLeaveApproval.get,
    "leave-approvals",
    filters
  )
}

// Hook for fetching leave approval by ID
export function useGetLeaveApprovalById(approvalId: string | undefined) {
  return useGetById<ILeaveRequest>(
    HrLeaveApproval.getById,
    "leave-approval",
    approvalId || "",
    {
      enabled: !!approvalId && approvalId !== "0",
      queryKey: ["leave-approval", approvalId],
    }
  )
}

// Hook for fetching leave approvals by request
export function useGetLeaveApprovalsByRequest(leaveId: string | undefined) {
  return useGetByParams<ILeaveRequest[]>(
    HrLeaveApproval.getByRequest,
    "leave-approvals-by-request",
    leaveId || "",
    {
      enabled: !!leaveId && leaveId.trim() !== "",
      queryKey: ["leave-approvals-by-request", leaveId],
    }
  )
}

// Hook for fetching leave approvals by approver
export function useGetLeaveApprovalsByApprover(approverId: string | undefined) {
  return useGetByParams<ILeaveRequest[]>(
    HrLeaveApproval.getByApprover,
    "leave-approvals-by-approver",
    approverId || "",
    {
      enabled: !!approverId && approverId.trim() !== "",
      queryKey: ["leave-approvals-by-approver", approverId],
    }
  )
}

// Hook for fetching pending leave approvals
export function useGetPendingLeaveApprovals() {
  return useGet<ILeaveRequest[]>(
    HrLeaveApproval.getPending,
    "pending-leave-approvals"
  )
}

// Hook for approving leave
export function useApproveLeave() {
  const queryClient = useQueryClient()
  const approveMutation = usePersist<{
    leaveId: string
    approverId: string
    comments?: string
  }>(HrLeaveApproval.approve)

  return {
    ...approveMutation,
    mutate: (data: {
      leaveId: string
      approverId: string
      comments?: string
    }) => {
      approveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-approver"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-approvals"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["approved-leave-requests"],
            })
          }
        },
      })
    },
  }
}

// Hook for rejecting leave
export function useRejectLeave() {
  const queryClient = useQueryClient()
  const rejectMutation = usePersist<{
    leaveId: string
    approverId: string
    reason: string
  }>(HrLeaveApproval.reject)

  return {
    ...rejectMutation,
    mutate: (data: { leaveId: string; approverId: string; reason: string }) => {
      rejectMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-approver"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-approvals"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
            queryClient.invalidateQueries({
              queryKey: ["rejected-leave-requests"],
            })
          }
        },
      })
    },
  }
}

// Hook for skipping approval level
export function useSkipApproval() {
  const queryClient = useQueryClient()
  const skipMutation = usePersist<{ leaveId: string; approverId: string }>(
    HrLeaveApproval.skip
  )

  return {
    ...skipMutation,
    mutate: (data: { leaveId: string; approverId: string }) => {
      skipMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-approver"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-approvals"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
          }
        },
      })
    },
  }
}

// Hook for cancelling leave approval
export function useCancelLeaveApproval() {
  const queryClient = useQueryClient()
  const cancelMutation = usePersist<{ leaveId: string; approverId: string }>(
    HrLeaveApproval.cancel
  )

  return {
    ...cancelMutation,
    mutate: (data: { leaveId: string; approverId: string }) => {
      cancelMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-approvals"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-request"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-approvals-by-approver"],
            })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-approvals"],
            })
            queryClient.invalidateQueries({ queryKey: ["leave-requests"] })
            queryClient.invalidateQueries({
              queryKey: ["pending-leave-requests"],
            })
          }
        },
      })
    },
  }
}

// Hook for getting approval workflow
export function useGetApprovalWorkflow(leaveId: string | undefined) {
  return useGetByParams<{ steps: ILeaveRequest[]; currentStep: number }>(
    HrLeaveApproval.getWorkflow,
    "approval-workflow",
    leaveId || "",
    {
      enabled: !!leaveId && leaveId.trim() !== "",
      queryKey: ["approval-workflow", leaveId],
    }
  )
}
