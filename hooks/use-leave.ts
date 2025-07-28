import {
  ILeave,
  ILeaveBalance,
  ILeavePolicy,
  ILeaveRequest,
  ILeaveType,
  LeaveFormData,
  LeavePolicyFormData,
  LeaveReport,
  LeaveSummary,
} from "@/interfaces/leave"
import { useQueryClient } from "@tanstack/react-query"

import {
  HrLeave,
  HrLeaveApproval,
  HrLeaveAttachment,
  HrLeaveBalance,
  HrLeaveCalendar,
  HrLeaveCategory,
  HrLeaveDashboard,
  HrLeaveNotification,
  HrLeavePolicy,
  HrLeaveReport,
  HrLeaveRequest,
  HrLeaveSettings,
} from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  useSave,
  useUpdate,
} from "@/hooks/use-common"

// ===== LEAVE MANAGEMENT HOOKS =====

// Hook for fetching all leaves
export function useGetLeaves(filters?: string) {
  return useGet<ILeave>(HrLeave.get, "leaves", filters)
}

// Hook for fetching leave by ID
export function useGetLeaveById(leaveId: string | undefined) {
  return useGetById<ILeave>(HrLeave.getById, "leave", leaveId || "", {
    enabled: !!leaveId && leaveId !== "0",
  })
}

// Hook for fetching leaves by employee
export function useGetLeavesByEmployee(employeeId: string | undefined) {
  return useGetByParams<ILeave>(
    HrLeave.getByEmployee,
    "leaves-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
    }
  )
}

// Hook for fetching leaves by department
export function useGetLeavesByDepartment(departmentId: string | undefined) {
  return useGetByParams<ILeave>(
    HrLeave.getByDepartment,
    "leaves-by-department",
    departmentId || "",
    {
      enabled: !!departmentId && departmentId.trim() !== "",
    }
  )
}

// Hook for fetching leaves by status
export function useGetLeavesByStatus(status: string | undefined) {
  return useGetByParams<ILeave>(
    HrLeave.getByStatus,
    "leaves-by-status",
    status || "",
    {
      enabled: !!status && status.trim() !== "",
    }
  )
}

// Hook for fetching leaves by date range
export function useGetLeavesByDateRange(startDate: string, endDate: string) {
  return useGetByParams<ILeave>(
    HrLeave.getByDateRange,
    "leaves-by-date-range",
    `${startDate}/${endDate}`,
    {
      enabled: !!startDate && !!endDate,
    }
  )
}

// Hook for saving leave
export function useSaveLeave() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<ILeave>(HrLeave.add)

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
  const updateMutation = useUpdate<ILeave>(HrLeave.update)

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
  const deleteMutation = useDelete(HrLeave.delete)

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

// Hook for leave bulk actions
export function useLeaveBulkAction() {
  const queryClient = useQueryClient()
  const bulkMutation = useSave<{ action: string; leaveIds: string[] }>(
    HrLeave.bulkAction
  )

  return {
    ...bulkMutation,
    mutate: (data: { action: string; leaveIds: string[] }) => {
      bulkMutation.mutate(data, {
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

// Hook for leave summary
export function useGetLeaveSummary(filters?: string) {
  return useGet<LeaveSummary[]>(HrLeave.summary, "leave-summary", filters)
}

// Hook for leave report
export function useGetLeaveReport(filters?: string) {
  return useGet<LeaveReport[]>(HrLeave.report, "leave-report", filters)
}

// Note: Leave Type hooks removed as HrLeaveType is not available in api-routes

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
    }
  )
}

// Hook for saving leave balance
export function useSaveLeaveBalance() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<ILeaveBalance>(HrLeaveBalance.add)

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
  const updateMutation = useUpdate<ILeaveBalance>(HrLeaveBalance.update)

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
  const bulkUpdateMutation = useSave<ILeaveBalance[]>(HrLeaveBalance.bulkUpdate)

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
  const resetMutation = useSave<{ year: number; companyId: string }>(
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
    }
  )
}

// Hook for fetching leave policies by company
export function useGetLeavePoliciesByCompany(companyId: string | undefined) {
  return useGetByParams<ILeavePolicy>(
    HrLeavePolicy.getByCompany,
    "leave-policies-by-company",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for fetching active leave policies
export function useGetActiveLeavePolicies() {
  return useGet<ILeavePolicy>(HrLeavePolicy.getActive, "active-leave-policies")
}

// Hook for saving leave policy
export function useSaveLeavePolicy() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<ILeavePolicy>(HrLeavePolicy.add)

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

// Hook for updating leave policy
export function useUpdateLeavePolicy() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<ILeavePolicy>(HrLeavePolicy.update)

  return {
    ...updateMutation,
    mutate: (data: Partial<ILeavePolicy>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-policies"] })
            queryClient.invalidateQueries({ queryKey: ["leave-policy"] })
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
  const saveMutation = useSave<ILeaveRequest>(HrLeaveRequest.add)

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
  const updateMutation = useUpdate<ILeaveRequest>(HrLeaveRequest.update)

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

// Hook for leave request bulk actions
export function useLeaveRequestBulkAction() {
  const queryClient = useQueryClient()
  const bulkActionMutation = useSave<{ action: string; requestIds: string[] }>(
    HrLeaveRequest.bulkAction
  )

  return {
    ...bulkActionMutation,
    mutate: (data: { action: string; requestIds: string[] }) => {
      bulkActionMutation.mutate(data, {
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
  const approveMutation = useSave<{
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
  const rejectMutation = useSave<{
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
  const skipMutation = useSave<{ leaveId: string; approverId: string }>(
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
  const cancelMutation = useSave<{ leaveId: string; approverId: string }>(
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
  return useGetByParams<{ steps: any[]; currentStep: number }>(
    HrLeaveApproval.getWorkflow,
    "approval-workflow",
    leaveId || "",
    {
      enabled: !!leaveId && leaveId.trim() !== "",
    }
  )
}

// ===== LEAVE CALENDAR HOOKS =====

// Hook for fetching leave calendar
export function useGetLeaveCalendar(filters?: string) {
  return useGet<ILeave[]>(HrLeaveCalendar.get, "leave-calendar", filters)
}

// Hook for fetching leave calendar by employee
export function useGetLeaveCalendarByEmployee(employeeId: string | undefined) {
  return useGetByParams<ILeave[]>(
    HrLeaveCalendar.getByEmployee,
    "leave-calendar-by-employee",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
    }
  )
}

// Hook for fetching leave calendar by date
export function useGetLeaveCalendarByDate(date: string | undefined) {
  return useGetByParams<ILeave[]>(
    HrLeaveCalendar.getByDate,
    "leave-calendar-by-date",
    date || "",
    {
      enabled: !!date && date.trim() !== "",
    }
  )
}

// Hook for fetching leave calendar by date range
export function useGetLeaveCalendarByDateRange(
  startDate: string,
  endDate: string
) {
  return useGetByParams<ILeave[]>(
    HrLeaveCalendar.getByDateRange,
    "leave-calendar-by-date-range",
    `${startDate}/${endDate}`,
    {
      enabled: !!startDate && !!endDate,
    }
  )
}

// Hook for saving leave calendar entry
export function useSaveLeaveCalendar() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<ILeave>(HrLeaveCalendar.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<ILeave>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-calendar"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date-range"],
            })
          }
        },
      })
    },
  }
}

// Hook for updating leave calendar entry
export function useUpdateLeaveCalendar() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<ILeave>(HrLeaveCalendar.update)

  return {
    ...updateMutation,
    mutate: (data: Partial<ILeave>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-calendar"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date-range"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave calendar entry
export function useDeleteLeaveCalendar() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveCalendar.delete)

  return {
    ...deleteMutation,
    mutate: (calendarId: string) => {
      deleteMutation.mutate(calendarId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-calendar"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date-range"],
            })
          }
        },
      })
    },
  }
}

// Hook for bulk adding leave calendar entries
export function useBulkAddLeaveCalendar() {
  const queryClient = useQueryClient()
  const bulkMutation = useSave<ILeave[]>(HrLeaveCalendar.bulkAdd)

  return {
    ...bulkMutation,
    mutate: (data: ILeave[]) => {
      bulkMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-calendar"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-employee"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date"],
            })
            queryClient.invalidateQueries({
              queryKey: ["leave-calendar-by-date-range"],
            })
          }
        },
      })
    },
  }
}

// ===== LEAVE SETTINGS HOOKS =====

// Hook for fetching leave settings
export function useGetLeaveSettings(filters?: string) {
  return useGet<any>(HrLeaveSettings.get, "leave-settings", filters)
}

// Hook for fetching leave settings by company
export function useGetLeaveSettingsByCompany(companyId: string | undefined) {
  return useGetByParams<any>(
    HrLeaveSettings.getByCompany,
    "leave-settings-by-company",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for saving leave settings
export function useSaveLeaveSettings() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<any>(HrLeaveSettings.add)

  return {
    ...saveMutation,
    mutate: (data: any) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-settings-by-company"],
            })
          }
        },
      })
    },
  }
}

// Hook for updating leave settings
export function useUpdateLeaveSettings() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<any>(HrLeaveSettings.update)

  return {
    ...updateMutation,
    mutate: (data: any) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-settings-by-company"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave settings
export function useDeleteLeaveSettings() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveSettings.delete)

  return {
    ...deleteMutation,
    mutate: (settingsId: string) => {
      deleteMutation.mutate(settingsId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-settings-by-company"],
            })
          }
        },
      })
    },
  }
}

// Hook for fetching holidays
export function useGetHolidays(companyId: string | undefined) {
  return useGetByParams<any[]>(
    HrLeaveSettings.getHolidays,
    "holidays",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for updating holidays
export function useUpdateHolidays() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<any[]>(HrLeaveSettings.updateHolidays)

  return {
    ...updateMutation,
    mutate: (data: any[]) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["holidays"] })
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-settings-by-company"],
            })
          }
        },
      })
    },
  }
}

// Hook for fetching working hours
export function useGetWorkingHours(companyId: string | undefined) {
  return useGetByParams<any>(
    HrLeaveSettings.getWorkingHours,
    "working-hours",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for updating working hours
export function useUpdateWorkingHours() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<any>(HrLeaveSettings.updateWorkingHours)

  return {
    ...updateMutation,
    mutate: (data: any) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["working-hours"] })
            queryClient.invalidateQueries({ queryKey: ["leave-settings"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-settings-by-company"],
            })
          }
        },
      })
    },
  }
}

// ===== LEAVE CATEGORY HOOKS =====

// Hook for fetching leave categories
export function useGetLeaveCategories(filters?: string) {
  return useGet<any[]>(HrLeaveCategory.get, "leave-categories", filters)
}

// Hook for fetching leave category by ID
export function useGetLeaveCategoryById(categoryId: string | undefined) {
  return useGetById<any>(
    HrLeaveCategory.getById,
    "leave-category",
    categoryId || "",
    {
      enabled: !!categoryId && categoryId !== "0",
    }
  )
}

// Hook for fetching active leave categories
export function useGetActiveLeaveCategories() {
  return useGet<any[]>(HrLeaveCategory.getActive, "active-leave-categories")
}

// Hook for saving leave category
export function useSaveLeaveCategory() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<any>(HrLeaveCategory.add)

  return {
    ...saveMutation,
    mutate: (data: any) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-categories"] })
            queryClient.invalidateQueries({
              queryKey: ["active-leave-categories"],
            })
          }
        },
      })
    },
  }
}

// Hook for updating leave category
export function useUpdateLeaveCategory() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<any>(HrLeaveCategory.update)

  return {
    ...updateMutation,
    mutate: (data: any) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-categories"] })
            queryClient.invalidateQueries({ queryKey: ["leave-category"] })
            queryClient.invalidateQueries({
              queryKey: ["active-leave-categories"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave category
export function useDeleteLeaveCategory() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveCategory.delete)

  return {
    ...deleteMutation,
    mutate: (categoryId: string) => {
      deleteMutation.mutate(categoryId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-categories"] })
            queryClient.invalidateQueries({
              queryKey: ["active-leave-categories"],
            })
          }
        },
      })
    },
  }
}

// ===== LEAVE ATTACHMENT HOOKS =====

// Hook for fetching leave attachments
export function useGetLeaveAttachments(filters?: string) {
  return useGet<any[]>(HrLeaveAttachment.get, "leave-attachments", filters)
}

// Hook for fetching leave attachment by ID
export function useGetLeaveAttachmentById(attachmentId: string | undefined) {
  return useGetById<any>(
    HrLeaveAttachment.getById,
    "leave-attachment",
    attachmentId || "",
    {
      enabled: !!attachmentId && attachmentId !== "0",
    }
  )
}

// Hook for uploading leave attachment
export function useUploadLeaveAttachment() {
  const queryClient = useQueryClient()
  const uploadMutation = useSave<any>(HrLeaveAttachment.upload)

  return {
    ...uploadMutation,
    mutate: (data: FormData) => {
      uploadMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-attachments"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-attachments-by-leave"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting leave attachment
export function useDeleteLeaveAttachment() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveAttachment.delete)

  return {
    ...deleteMutation,
    mutate: (attachmentId: string) => {
      deleteMutation.mutate(attachmentId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-attachments"] })
            queryClient.invalidateQueries({
              queryKey: ["leave-attachments-by-leave"],
            })
          }
        },
      })
    },
  }
}

// Hook for downloading leave attachment
export function useDownloadLeaveAttachment() {
  return useGetByParams<Blob>(
    HrLeaveAttachment.download,
    "download-attachment",
    "",
    {
      enabled: false,
    }
  )
}

// Hook for fetching leave attachments by leave
export function useGetLeaveAttachmentsByLeave(leaveId: string | undefined) {
  return useGetByParams<any[]>(
    HrLeaveAttachment.getByLeave,
    "leave-attachments-by-leave",
    leaveId || "",
    {
      enabled: !!leaveId && leaveId.trim() !== "",
    }
  )
}

// ===== LEAVE NOTIFICATION HOOKS =====

// Hook for fetching leave notifications
export function useGetLeaveNotifications(filters?: string) {
  return useGet<any[]>(HrLeaveNotification.get, "leave-notifications", filters)
}

// Hook for fetching leave notification by ID
export function useGetLeaveNotificationById(
  notificationId: string | undefined
) {
  return useGetById<any>(
    HrLeaveNotification.getById,
    "leave-notification",
    notificationId || "",
    {
      enabled: !!notificationId && notificationId !== "0",
    }
  )
}

// Hook for marking notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const markReadMutation = useUpdate<any>(HrLeaveNotification.markRead)

  return {
    ...markReadMutation,
    mutate: (notificationId: string) => {
      markReadMutation.mutate(
        { id: notificationId, isRead: true },
        {
          onSuccess: (response) => {
            if (response.result === 1) {
              queryClient.invalidateQueries({
                queryKey: ["leave-notifications"],
              })
            }
          },
        }
      )
    },
  }
}

// Hook for marking all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const markAllReadMutation = useUpdate<any>(HrLeaveNotification.markAllRead)

  return {
    ...markAllReadMutation,
    mutate: (userId: string) => {
      markAllReadMutation.mutate(
        { userId },
        {
          onSuccess: (response) => {
            if (response.result === 1) {
              queryClient.invalidateQueries({
                queryKey: ["leave-notifications"],
              })
            }
          },
        }
      )
    },
  }
}

// Hook for deleting leave notification
export function useDeleteLeaveNotification() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(HrLeaveNotification.delete)

  return {
    ...deleteMutation,
    mutate: (notificationId: string) => {
      deleteMutation.mutate(notificationId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-notifications"] })
          }
        },
      })
    },
  }
}

// Hook for sending leave notification
export function useSendLeaveNotification() {
  const queryClient = useQueryClient()
  const sendMutation = useSave<any>(HrLeaveNotification.sendNotification)

  return {
    ...sendMutation,
    mutate: (data: any) => {
      sendMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-notifications"] })
          }
        },
      })
    },
  }
}

// ===== LEAVE DASHBOARD HOOKS =====

// Hook for fetching leave dashboard stats
export function useGetLeaveDashboardStats(companyId: string | undefined) {
  return useGetByParams<any>(
    HrLeaveDashboard.getStats,
    "leave-dashboard-stats",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for fetching employee leave stats
export function useGetEmployeeLeaveStats(employeeId: string | undefined) {
  return useGetByParams<any>(
    HrLeaveDashboard.getEmployeeStats,
    "employee-leave-stats",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
    }
  )
}

// Hook for fetching department leave stats
export function useGetDepartmentLeaveStats(departmentId: string | undefined) {
  return useGetByParams<any>(
    HrLeaveDashboard.getDepartmentStats,
    "department-leave-stats",
    departmentId || "",
    {
      enabled: !!departmentId && departmentId.trim() !== "",
    }
  )
}

// Hook for fetching leave trends
export function useGetLeaveTrends(companyId: string | undefined) {
  return useGetByParams<any[]>(
    HrLeaveDashboard.getLeaveTrends,
    "leave-trends",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for fetching upcoming leaves
export function useGetUpcomingLeaves(companyId: string | undefined) {
  return useGetByParams<ILeave[]>(
    HrLeaveDashboard.getUpcomingLeaves,
    "upcoming-leaves",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for fetching pending approvals
export function useGetPendingApprovals(approverId: string | undefined) {
  return useGetByParams<ILeaveRequest[]>(
    HrLeaveDashboard.getPendingApprovals,
    "pending-approvals",
    approverId || "",
    {
      enabled: !!approverId && approverId.trim() !== "",
    }
  )
}

// Hook for fetching leave calendar for dashboard
export function useGetLeaveCalendarForDashboard(companyId: string | undefined) {
  return useGetByParams<ILeave[]>(
    HrLeaveDashboard.getLeaveCalendar,
    "leave-calendar-dashboard",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for fetching leave summary for dashboard
export function useGetLeaveSummaryForDashboard(companyId: string | undefined) {
  return useGetByParams<LeaveSummary[]>(
    HrLeaveDashboard.getLeaveSummary,
    "leave-summary-dashboard",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// ===== LEAVE REPORT HOOKS =====

// Hook for fetching employee leave report
export function useGetEmployeeLeaveReport(employeeId: string | undefined) {
  return useGetByParams<LeaveReport[]>(
    HrLeaveReport.getEmployeeReport,
    "employee-leave-report",
    employeeId || "",
    {
      enabled: !!employeeId && employeeId.trim() !== "",
    }
  )
}

// Hook for fetching department leave report
export function useGetDepartmentLeaveReport(departmentId: string | undefined) {
  return useGetByParams<LeaveReport[]>(
    HrLeaveReport.getDepartmentReport,
    "department-leave-report",
    departmentId || "",
    {
      enabled: !!departmentId && departmentId.trim() !== "",
    }
  )
}

// Hook for fetching leave type report
export function useGetLeaveTypeReport(leaveTypeId: string | undefined) {
  return useGetByParams<LeaveReport[]>(
    HrLeaveReport.getLeaveTypeReport,
    "leave-type-report",
    leaveTypeId || "",
    {
      enabled: !!leaveTypeId && leaveTypeId.trim() !== "",
    }
  )
}

// Hook for fetching balance report
export function useGetBalanceReport(companyId: string | undefined) {
  return useGetByParams<LeaveReport[]>(
    HrLeaveReport.getBalanceReport,
    "balance-report",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for fetching approval report
export function useGetApprovalReport(approverId: string | undefined) {
  return useGetByParams<LeaveReport[]>(
    HrLeaveReport.getApprovalReport,
    "approval-report",
    approverId || "",
    {
      enabled: !!approverId && approverId.trim() !== "",
    }
  )
}

// Hook for fetching trend report
export function useGetTrendReport(companyId: string | undefined) {
  return useGetByParams<LeaveReport[]>(
    HrLeaveReport.getTrendReport,
    "trend-report",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for exporting leave report
export function useExportLeaveReport() {
  const queryClient = useQueryClient()
  const exportMutation = useSave<any>(HrLeaveReport.exportReport)

  return {
    ...exportMutation,
    mutate: (data: any) => {
      exportMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["leave-reports"] })
          }
        },
      })
    },
  }
}

// Hook for fetching custom leave report
export function useGetCustomLeaveReport(filters?: string) {
  return useGet<LeaveReport[]>(
    HrLeaveReport.getCustomReport,
    "custom-leave-report",
    filters
  )
}

// ===== LEGACY COMPATIBILITY HOOKS =====

// Hook for leave approval actions (legacy)
export function useLeaveApprovalActions() {
  const queryClient = useQueryClient()
  const approveMutation = useUpdate<ILeave>(HrLeaveRequest.update)
  const rejectMutation = useUpdate<ILeave>(HrLeaveRequest.update)

  const approveLeave = (
    leaveId: string,
    approverId: string,
    comments?: string
  ) => {
    approveMutation.mutate(
      {
        leaveId: parseInt(leaveId),
        statusName: "APPROVED",
        actionById: parseInt(approverId),
        actionDate: new Date().toISOString(),
        actionRemarks: comments,
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
        leaveId: parseInt(leaveId),
        statusName: "REJECTED",
        actionById: parseInt(rejectorId),
        actionDate: new Date().toISOString(),
        actionRemarks: rejectionReason,
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

// Hook for leave statistics (legacy)
export function useLeaveStatistics(companyId: string | undefined) {
  return useGetByParams<{
    totalLeaves: number
    pendingLeaves: number
    approvedLeaves: number
    rejectedLeaves: number
    totalEmployees: number
    employeesOnLeave: number
  }>(HrLeaveDashboard.getStats, "leave-statistics", companyId || "", {
    enabled: !!companyId && companyId.trim() !== "",
  })
}
