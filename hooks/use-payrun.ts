import { useCallback, useState } from "react"
import { IPayRun, IPayRunDashboard, IPayRunFilter } from "@/interfaces/payrun"
import { useAuthStore } from "@/stores/auth-store"

import { deleteData, getData, postData, updateData } from "@/lib/api-client"

// API Routes
const PayRunRoutes = {
  // Pay Runs
  getPayRuns: "/api/payrun/payruns",
  getPayRunById: "/api/payrun/payruns",
  createPayRun: "/api/payrun/payruns",
  updatePayRun: "/api/payrun/payruns",
  deletePayRun: "/api/payrun/payruns",
  processPayRun: "/api/payrun/payruns/process",
  approvePayRun: "/api/payrun/payruns/approve",

  // Dashboard
  getDashboard: "/api/payrun/dashboard",
}

interface UsePayRunReturn {
  // State
  payRuns: IPayRun[]
  dashboard: IPayRunDashboard | null
  isLoading: boolean
  error: string | null

  // Pay Run actions
  fetchPayRuns: (filters?: IPayRunFilter) => Promise<void>
  fetchPayRunById: (payRunId: number) => Promise<IPayRun | null>
  createPayRun: (data: Partial<IPayRun>) => Promise<boolean>
  updatePayRun: (payRunId: number, data: Partial<IPayRun>) => Promise<boolean>
  deletePayRun: (payRunId: number) => Promise<boolean>
  processPayRun: (payRunId: number) => Promise<boolean>
  approvePayRun: (payRunId: number) => Promise<boolean>

  // Dashboard
  fetchDashboard: () => Promise<void>

  // Utilities
  clearError: () => void
}

export const usePayRun = (): UsePayRunReturn => {
  const { token, user, currentCompany } = useAuthStore()
  const [payRuns, setPayRuns] = useState<IPayRun[]>([])
  const [dashboard, setDashboard] = useState<IPayRunDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fetch pay runs
  const fetchPayRuns = useCallback(
    async (filters?: IPayRunFilter) => {
      if (!token || !user || !currentCompany) return

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString())
            }
          })
        }

        const response = await getData(
          PayRunRoutes.getPayRuns,
          Object.fromEntries(params)
        )

        if (response.result === 1) {
          setPayRuns(response.data || [])
        } else {
          setError(response.message || "Failed to fetch pay runs")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany]
  )

  // Fetch pay run by ID
  const fetchPayRunById = useCallback(
    async (payRunId: number): Promise<IPayRun | null> => {
      if (!token || !user || !currentCompany) return null

      setIsLoading(true)
      setError(null)

      try {
        const response = await getData(
          `${PayRunRoutes.getPayRunById}/${payRunId}`
        )

        if (response.result === 1) {
          return response.data
        } else {
          setError(response.message || "Failed to fetch pay run")
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany]
  )

  // Create pay run
  const createPayRun = useCallback(
    async (data: Partial<IPayRun>): Promise<boolean> => {
      if (!token || !user || !currentCompany) return false

      setIsLoading(true)
      setError(null)

      try {
        const response = await postData(PayRunRoutes.createPayRun, data)

        if (response.result === 1) {
          // Refresh pay runs list
          await fetchPayRuns()
          return true
        } else {
          setError(response.message || "Failed to create pay run")
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany, fetchPayRuns]
  )

  // Update pay run
  const updatePayRun = useCallback(
    async (payRunId: number, data: Partial<IPayRun>): Promise<boolean> => {
      if (!token || !user || !currentCompany) return false

      setIsLoading(true)
      setError(null)

      try {
        const response = await updateData(
          `${PayRunRoutes.updatePayRun}/${payRunId}`,
          data
        )

        if (response.result === 1) {
          // Refresh pay runs list
          await fetchPayRuns()
          return true
        } else {
          setError(response.message || "Failed to update pay run")
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany, fetchPayRuns]
  )

  // Delete pay run
  const deletePayRun = useCallback(
    async (payRunId: number): Promise<boolean> => {
      if (!token || !user || !currentCompany) return false

      setIsLoading(true)
      setError(null)

      try {
        const response = await deleteData(
          `${PayRunRoutes.deletePayRun}/${payRunId}`
        )

        if (response.result === 1) {
          // Refresh pay runs list
          await fetchPayRuns()
          return true
        } else {
          setError(response.message || "Failed to delete pay run")
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany, fetchPayRuns]
  )

  // Process pay run
  const processPayRun = useCallback(
    async (payRunId: number): Promise<boolean> => {
      if (!token || !user || !currentCompany) return false

      setIsLoading(true)
      setError(null)

      try {
        const response = await updateData(
          `${PayRunRoutes.processPayRun}/${payRunId}`,
          {}
        )

        if (response.result === 1) {
          // Refresh pay runs list
          await fetchPayRuns()
          return true
        } else {
          setError(response.message || "Failed to process pay run")
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany, fetchPayRuns]
  )

  // Approve pay run
  const approvePayRun = useCallback(
    async (payRunId: number): Promise<boolean> => {
      if (!token || !user || !currentCompany) return false

      setIsLoading(true)
      setError(null)

      try {
        const response = await updateData(
          `${PayRunRoutes.approvePayRun}/${payRunId}`,
          {}
        )

        if (response.result === 1) {
          // Refresh pay runs list
          await fetchPayRuns()
          return true
        } else {
          setError(response.message || "Failed to approve pay run")
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [token, user, currentCompany, fetchPayRuns]
  )

  // Fetch dashboard
  const fetchDashboard = useCallback(async () => {
    if (!token || !user || !currentCompany) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getData(PayRunRoutes.getDashboard)

      if (response.result === 1) {
        setDashboard(response.data)
      } else {
        setError(response.message || "Failed to fetch dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [token, user, currentCompany])

  return {
    // State
    payRuns,
    dashboard,
    isLoading,
    error,

    // Pay Run actions
    fetchPayRuns,
    fetchPayRunById,
    createPayRun,
    updatePayRun,
    deletePayRun,
    processPayRun,
    approvePayRun,

    // Dashboard
    fetchDashboard,

    // Utilities
    clearError,
  }
}
