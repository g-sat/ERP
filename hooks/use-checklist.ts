import { IJobOrderHd } from "@/interfaces/checklist"
import { useQuery } from "@tanstack/react-query"

import { getData, saveData } from "@/lib/api-client"
import { JobOrder } from "@/lib/api-routes"

import { useDelete, useGet, useGetById, usePersist } from "./use-common"

// Enhanced query hooks using api-client.ts
export function useGetJobOrders(filters?: string) {
  return useGet<IJobOrderHd>(JobOrder.get, "joborders", filters)
}
export function useGetJobOrderById(id: string) {
  return useGetById<IJobOrderHd>(JobOrder.getById, "joborder", id)
}
export function useGetJobOrderByIdNo(jobOrderId: string) {
  return useQuery<{
    result: number
    message: string
    data: IJobOrderHd
    totalRecords: number
  }>({
    queryKey: ["joborder", jobOrderId],
    queryFn: async () => {
      // Using the api-client.ts getData function for consistent API calls
      const data = await getData(`${JobOrder.getById}/${jobOrderId}`)
      return data
    },
    enabled: !!jobOrderId,
    staleTime: 0, // Data is considered stale immediately
    gcTime: 0, // Don't cache the data (garbage collection time)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}
// Enhanced mutation hooks using api-client.ts
export function useSaveJobOrder() {
  return usePersist<IJobOrderHd>(JobOrder.add)
}
export function useUpdateJobOrder() {
  return usePersist<IJobOrderHd>(JobOrder.add)
}
export function useDeleteJobOrder() {
  return useDelete(JobOrder.delete)
}
export function useGetJobOrderDetails(id: string) {
  return useGetById<IJobOrderHd>(JobOrder.getDetails, "joborderdetails", id)
}
export function useSaveJobOrderDetails() {
  return usePersist<IJobOrderHd>(JobOrder.saveDetails)
}
// Enhanced query hooks for better api-client.ts integration
export function useGetJobOrderByParams(
  params: Record<string, string>,
  companyId: string
) {
  return useQuery<{
    result: number
    message: string
    data: IJobOrderHd[]
    totalRecords: number
  }>({
    queryKey: ["joborder", "params", params, companyId],
    queryFn: async () => {
      // Using the api-client.ts getData function with parameters
      const data = await getData(JobOrder.get, params)
      return data
    },
    enabled: Object.keys(params).length > 0 && !!companyId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}
// Enhanced direct API call functions using api-client.ts
export const saveJobOrderDirect = async (
  jobOrderData: Partial<IJobOrderHd>
) => {
  try {
    const response = await saveData(JobOrder.add, jobOrderData)
    return response
  } catch (error) {
    console.error("Error saving job order:", error)
    throw error
  }
}
export const updateJobOrderDirect = async (
  jobOrderData: Partial<IJobOrderHd>
) => {
  try {
    console.log("Updating job order:", jobOrderData)
    const response = await saveData(JobOrder.add, jobOrderData)
    return response
  } catch (error) {
    console.error("Error updating job order:", error)
    throw error
  }
}
export const deleteJobOrderDirect = async (jobOrderId: string) => {
  try {
    const response = await getData(`${JobOrder.delete}/${jobOrderId}`)
    return response
  } catch (error) {
    console.error("Error deleting job order:", error)
    throw error
  }
}
export const getJobOrderByIdNoDirect = async (jobOrderId: string) => {
  try {
    const response = await getData(`${JobOrder.getById}/${jobOrderId}`)
    return response
  } catch (error) {
    console.error("Error fetching job order by ID:", error)
    throw error
  }
}
// Additional utility functions for better api-client.ts integration
export const getJobOrderDetailsDirect = async (jobOrderId: string) => {
  try {
    const response = await getData(`${JobOrder.getDetails}/${jobOrderId}`)
    return response
  } catch (error) {
    console.error("Error fetching job order details:", error)
    throw error
  }
}
export const saveJobOrderDetailsDirect = async (
  detailsData: Record<string, unknown>
) => {
  try {
    const response = await saveData(JobOrder.saveDetails, detailsData)
    return response
  } catch (error) {
    console.error("Error saving job order details:", error)
    throw error
  }
}
// Enhanced search and filter functions
export const searchJobOrdersDirect = async (searchParams: {
  searchString?: string
  startDate?: string
  endDate?: string
  statusId?: number
  customerId?: number
  portId?: number
}) => {
  try {
    const params = {
      searchString: searchParams.searchString || "",
      startDate: searchParams.startDate || "",
      endDate: searchParams.endDate || "",
      statusId: searchParams.statusId?.toString() || "",
      customerId: searchParams.customerId?.toString() || "",
      portId: searchParams.portId?.toString() || "",
    }
    const response = await getData(JobOrder.get, params)
    return response
  } catch (error) {
    console.error("Error searching job orders:", error)
    throw error
  }
}
// Bulk operations using api-client.ts
export const bulkUpdateJobOrdersDirect = async (
  jobOrders: Partial<IJobOrderHd>[]
) => {
  try {
    const response = await saveData(`${JobOrder.add}/bulk`, { jobOrders })
    return response
  } catch (error) {
    console.error("Error bulk updating job orders:", error)
    throw error
  }
}
export const bulkDeleteJobOrdersDirect = async (jobOrderIds: string[]) => {
  try {
    const response = await getData(`${JobOrder.delete}/bulk`, {
      jobOrderIds: jobOrderIds.join(","),
    })
    return response
  } catch (error) {
    console.error("Error bulk deleting job orders:", error)
    throw error
  }
}
// Export functionality
export const exportJobOrdersDirect = async (
  format: "pdf" | "excel" | "csv",
  filters?: Record<string, string>
) => {
  try {
    const params = {
      format,
      ...filters,
    }
    const response = await getData(`${JobOrder.get}/export`, params)
    return response
  } catch (error) {
    console.error("Error exporting job orders:", error)
    throw error
  }
}
// Print functionality
export const printJobOrderDirect = async (
  jobOrderId: string,
  printType: string
) => {
  try {
    const response = await getData(`${JobOrder.get}/${jobOrderId}/print`, {
      printType,
    })
    return response
  } catch (error) {
    console.error("Error printing job order:", error)
    throw error
  }
}
