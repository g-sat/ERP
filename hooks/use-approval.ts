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
import { Approval } from "@/lib/api-routes"

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
  fetchApprovalCounts: () => Promise<{
    pendingCount: number
    myRequestsCount: number
  } | null>

  // Utilities
  getStatusBadgeVariant: (
    statusId: number
  ) => "default" | "secondary" | "destructive" | "outline"
  getStatusText: (statusId: number) => string
  getActionTypeText: (statusId: number) => string
  canTakeAction: (request: IApprovalRequest) => boolean
}

interface UseApprovalCountsReturn {
  pendingCount: number
  isLoading: boolean
  error: string | null
  refreshCounts: () => Promise<void>
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
      const response = await getData(Approval.get, params)

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
      const response = await getData(Approval.getPending, params)

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
        const response = await getData(
          `${Approval.getRequestDetail}/${requestId}`
        )

        if (response.result === 1) {
          setRequestDetail(response.data || null)
        } else {
          setError(response.message || "Failed to fetch request detail")
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
        const response = await postData(Approval.takeAction, action)

        if (response.result === 1) {
          // Refresh the requests after taking action
          await fetchPendingApprovals()
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
    [token, user, currentCompany, fetchPendingApprovals]
  )

  const refreshRequests = useCallback(async () => {
    await fetchPendingApprovals()
  }, [fetchPendingApprovals])

  const fetchApprovalCounts = useCallback(async () => {
    if (!token || !user || !currentCompany) return null

    try {
      const response = await getData(Approval.getCounts)

      if (response.result === 1) {
        return {
          pendingCount: response.data?.pendingCount || 0,
          myRequestsCount: response.data?.myRequestsCount || 0,
        }
      } else {
        setError(response.message || "Failed to fetch approval counts")
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    }
  }, [token, user, currentCompany])

  const getStatusBadgeVariant = useCallback(
    (statusId: number): "default" | "secondary" | "destructive" | "outline" => {
      switch (statusId) {
        case APPROVAL_STATUS.APPROVED:
          return "default"
        case APPROVAL_STATUS.REJECTED:
          return "destructive"
        case APPROVAL_STATUS.PENDING:
          return "secondary"
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
      case APPROVAL_STATUS.REJECTED:
        return "Rejected"
      case APPROVAL_STATUS.PENDING:
        return "Pending"
      default:
        return "Unknown"
    }
  }, [])

  const getActionTypeText = useCallback((statusId: number): string => {
    switch (statusId) {
      case APPROVAL_ACTION_TYPES.APPROVED:
        return "Approved"
      case APPROVAL_ACTION_TYPES.REJECTED:
        return "Rejected"
      default:
        return "Unknown"
    }
  }, [])

  const canTakeAction = useCallback((request: IApprovalRequest): boolean => {
    // Check if the request is pending and the current user can take action
    return (
      request.statusId === APPROVAL_STATUS.PENDING && request.currentLevelId > 0
    )
  }, [])

  return {
    requests,
    requestDetail,
    isLoading,
    error,
    fetchMyRequests,
    fetchPendingApprovals,
    fetchRequestDetail,
    takeApprovalAction,
    refreshRequests,
    fetchApprovalCounts,
    getStatusBadgeVariant,
    getStatusText,
    getActionTypeText,
    canTakeAction,
  }
}

export const useApprovalCounts = (): UseApprovalCountsReturn => {
  const { token, user, currentCompany } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshCounts = useCallback(async () => {
    if (!token || !user || !currentCompany) return

    setIsLoading(true)
    setError(null)

    try {
      const params = {
        searchString: "null",
        pageNumber: "1",
        pageSize: "2000",
      }
      const response = await getData(Approval.getPending, params)

      if (response.result === 1) {
        const requests = response.data || []
        const count = requests.filter(
          (r: IApprovalRequest) => r.statusId === APPROVAL_STATUS.PENDING
        ).length
        setPendingCount(count)
      } else {
        setError(response.message || "Failed to fetch pending approvals")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [token, user, currentCompany])

  return {
    pendingCount,
    isLoading,
    error,
    refreshCounts,
  }
}
