import { useCallback, useState } from "react"
import {
  APPROVAL_ACTION_TYPES,
  APPROVAL_STATUS,
  IApprovalActionRequest,
  IApprovalRequest,
  IApprovalRequestDetail,
} from "@/interfaces/approval"
import { useAuthStore } from "@/stores/auth-store"

import { getData, postData } from "@/lib/api-client"

interface UseApprovalReturn {
  // State
  requests: IApprovalRequest[]
  requestDetail: IApprovalRequestDetail | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchMyRequests: () => Promise<void>
  fetchPendingApprovals: () => Promise<void>
  fetchRequestDetail: (requestId: number) => Promise<void>
  takeApprovalAction: (action: IApprovalActionRequest) => Promise<boolean>
  refreshRequests: () => Promise<void>

  // Utilities
  getStatusBadgeVariant: (
    statusId: number
  ) => "default" | "secondary" | "destructive" | "outline"
  getStatusText: (statusId: number) => string
  getActionTypeText: (actionTypeId: number) => string
  canTakeAction: (request: IApprovalRequest, userRoleId: number) => boolean
}

export const useApproval = (): UseApprovalReturn => {
  const { token, user, currentCompany } = useAuthStore()
  const [requests, setRequests] = useState<IApprovalRequest[]>([])
  const [requestDetail, setRequestDetail] =
    useState<IApprovalRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyRequests = useCallback(async () => {
    if (!token || !user || !currentCompany) return

    setIsLoading(true)
    setError(null)

    try {
      const params = {
        searchString: "null",
        pageNumber: "1",
        pageSize: "2000",
      }
      const response = await getData("/approval/my-requests", params)

      if (response.result === 1) {
        setRequests(response.data || [])
      } else {
        setError(response.message || "Failed to fetch requests")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [token, user, currentCompany])

  const fetchPendingApprovals = useCallback(async () => {
    if (!token || !user || !currentCompany) return

    setIsLoading(true)
    setError(null)

    try {
      const params = {
        searchString: "null",
        pageNumber: "1",
        pageSize: "2000",
      }
      const response = await getData("/approval/pending-approvals", params)

      if (response.result === 1) {
        setRequests(response.data || [])
      } else {
        setError(response.message || "Failed to fetch pending approvals")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [token, user, currentCompany])

  const fetchRequestDetail = useCallback(
    async (requestId: number) => {
      if (!token || !user || !currentCompany) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await getData(`/approval/request/${requestId}`)

        if (response.result === 1) {
          setRequestDetail(response.data)
        } else {
          setError(response.message || "Failed to fetch request details")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany]
  )

  const takeApprovalAction = useCallback(
    async (action: IApprovalActionRequest): Promise<boolean> => {
      if (!token || !user || !currentCompany) return false

      setIsLoading(true)
      setError(null)

      try {
        const response = await postData("/approval/take-action", action)

        if (response.result === 1) {
          // Refresh the current view
          await refreshRequests()
          return true
        } else {
          setError(response.message || "Failed to take action")
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany]
  )

  const refreshRequests = useCallback(async () => {
    // Refresh based on current context - could be enhanced to track current view
    await fetchMyRequests()
  }, [fetchMyRequests])

  // Utility functions
  const getStatusBadgeVariant = useCallback(
    (statusId: number): "default" | "secondary" | "destructive" | "outline" => {
      switch (statusId) {
        case APPROVAL_STATUS.APPROVED:
          return "default"
        case APPROVAL_STATUS.PENDING:
          return "secondary"
        case APPROVAL_STATUS.REJECTED:
          return "destructive"
        default:
          return "outline"
      }
    },
    []
  )

  const getStatusText = useCallback((statusId: number): string => {
    switch (statusId) {
      case APPROVAL_STATUS.APPROVED:
        return "Approved"
      case APPROVAL_STATUS.PENDING:
        return "Pending"
      case APPROVAL_STATUS.REJECTED:
        return "Rejected"
      default:
        return "Unknown"
    }
  }, [])

  const getActionTypeText = useCallback((actionTypeId: number): string => {
    switch (actionTypeId) {
      case APPROVAL_ACTION_TYPES.APPROVED:
        return "Approved"
      case APPROVAL_ACTION_TYPES.REJECTED:
        return "Rejected"
      default:
        return "Unknown"
    }
  }, [])

  const canTakeAction = useCallback(
    (request: IApprovalRequest, userRoleId: number): boolean => {
      // Check if request is pending and user has the right role for current level
      if (request.statusTypeId !== APPROVAL_STATUS.PENDING) {
        return false
      }

      // This logic should be enhanced based on your business rules
      // For now, assuming managers and admins can approve
      return userRoleId === 1 || userRoleId === 2
    },
    []
  )

  return {
    // State
    requests,
    requestDetail,
    isLoading,
    error,

    // Actions
    fetchMyRequests,
    fetchPendingApprovals,
    fetchRequestDetail,
    takeApprovalAction,
    refreshRequests,

    // Utilities
    getStatusBadgeVariant,
    getStatusText,
    getActionTypeText,
    canTakeAction,
  }
}
