import { useEffect, useState } from "react"
import {
  IAttendance,
  IAttendanceFilter,
  IAttendanceSummary,
} from "@/interfaces/attendance"

import { apiClient } from "@/lib/api-client"

export function useAttendance(companyId: string) {
  const [attendance, setAttendance] = useState<IAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<IAttendanceFilter>({
    type: "ALL",
  })

  // Fetch attendance data
  const fetchAttendance = async (filters?: IAttendanceFilter) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.department) params.append("department", filters.department)
      if (filters?.location) params.append("location", filters.location)
      if (filters?.employeeId) params.append("employeeId", filters.employeeId)
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters?.dateTo) params.append("dateTo", filters.dateTo)
      if (filters?.status) params.append("status", filters.status)
      if (filters?.type) params.append("type", filters.type)

      const response = await apiClient.get(
        `/companies/${companyId}/attendance?${params.toString()}`
      )
      setAttendance(response.data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch attendance data"
      )
    } finally {
      setLoading(false)
    }
  }

  // Create new attendance record
  const createAttendance = async (data: Partial<IAttendance>) => {
    try {
      setError(null)
      const response = await apiClient.post(
        `/companies/${companyId}/attendance`,
        data
      )
      setAttendance((prev) => [...prev, response.data])
      return response.data
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create attendance record"
      )
      throw err
    }
  }

  // Update attendance record
  const updateAttendance = async (id: string, data: Partial<IAttendance>) => {
    try {
      setError(null)
      const response = await apiClient.put(
        `/companies/${companyId}/attendance/${id}`,
        data
      )
      setAttendance((prev) =>
        prev.map((att) => (att.id === id ? response.data : att))
      )
      return response.data
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update attendance record"
      )
      throw err
    }
  }

  // Delete attendance record
  const deleteAttendance = async (id: string) => {
    try {
      setError(null)
      await apiClient.delete(`/companies/${companyId}/attendance/${id}`)
      setAttendance((prev) => prev.filter((att) => att.id !== id))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete attendance record"
      )
      throw err
    }
  }

  // Bulk update attendance
  const bulkUpdateAttendance = async (
    employeeIds: string[],
    data: Partial<IAttendance>
  ) => {
    try {
      setError(null)
      const response = await apiClient.post(
        `/companies/${companyId}/attendance/bulk-update`,
        {
          employeeIds,
          ...data,
        }
      )

      // Update local state with new data
      const updatedRecords = response.data
      setAttendance((prev) => {
        const updated = [...prev]
        updatedRecords.forEach((newRecord: IAttendance) => {
          const index = updated.findIndex((att) => att.id === newRecord.id)
          if (index !== -1) {
            updated[index] = newRecord
          } else {
            updated.push(newRecord)
          }
        })
        return updated
      })

      return response.data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk update attendance"
      )
      throw err
    }
  }

  // Get attendance summary
  const getAttendanceSummary = async (): Promise<IAttendanceSummary[]> => {
    try {
      setError(null)
      const response = await apiClient.get(
        `/companies/${companyId}/attendance/summary`
      )
      return response.data
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch attendance summary"
      )
      throw err
    }
  }

  // Export attendance data
  const exportAttendance = async (format: "csv" | "excel" = "csv") => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (filters?.department) params.append("department", filters.department)
      if (filters?.location) params.append("location", filters.location)
      if (filters?.employeeId) params.append("employeeId", filters.employeeId)
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters?.dateTo) params.append("dateTo", filters.dateTo)
      if (filters?.status) params.append("status", filters.status)
      if (filters?.type) params.append("type", filters.type)
      params.append("format", format)

      const response = await apiClient.get(
        `/companies/${companyId}/attendance/export?${params.toString()}`,
        {
          responseType: "blob",
        }
      )

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute(
        "download",
        `attendance-${new Date().toISOString().split("T")[0]}.${format}`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export attendance data"
      )
      throw err
    }
  }

  // Apply filters
  const applyFilters = (newFilters: IAttendanceFilter) => {
    setFilters(newFilters)
    fetchAttendance(newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    const defaultFilters: IAttendanceFilter = { type: "ALL" }
    setFilters(defaultFilters)
    fetchAttendance(defaultFilters)
  }

  // Initial fetch
  useEffect(() => {
    fetchAttendance(filters)
  }, [companyId])

  return {
    attendance,
    loading,
    error,
    filters,
    fetchAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    bulkUpdateAttendance,
    getAttendanceSummary,
    exportAttendance,
    applyFilters,
    clearFilters,
  }
}
