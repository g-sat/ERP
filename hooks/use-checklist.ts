import { IJobOrderHd } from "@/interfaces/checklist"
import { useQuery } from "@tanstack/react-query"

import { JobOrder } from "@/lib/api-routes"
import { apiProxy } from "@/lib/axios-config"

import { useDelete, useGet, useGetById, useSave, useUpdate } from "./use-common"

export function useGetJobOrders(filters?: string) {
  return useGet<IJobOrderHd>(JobOrder.get, "joborders", filters)
}

export function useGetJobOrderById(id: string) {
  return useGetById<IJobOrderHd>(JobOrder.getByIdNo, "joborder", id)
}

export function useGetJobOrderByIdNo(jobOrderId: string, companyId: string) {
  return useQuery<{
    result: number
    message: string
    data: IJobOrderHd
    totalRecords: number
  }>({
    queryKey: ["joborder", jobOrderId, companyId],
    queryFn: async () => {
      // Try using query parameters instead of path parameters
      const response = await apiProxy.get<{
        result: number
        message: string
        data: IJobOrderHd
        totalRecords: number
      }>(`${JobOrder.getByIdNo}/${jobOrderId}`, {
        headers: {
          "X-Company-Id": companyId,
        },
      })
      console.log("Job order details response:", response.data)
      return response.data
    },
    enabled: !!jobOrderId && !!companyId,
    staleTime: 0, // Data is considered stale immediately
    gcTime: 0, // Don't cache the data (garbage collection time)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}

export function useSaveJobOrder() {
  return useSave<IJobOrderHd>(JobOrder.add, "joborder")
}

export function useUpdateJobOrder() {
  return useUpdate<IJobOrderHd>(JobOrder.add, "joborder")
}

export function useDeleteJobOrder() {
  return useDelete(JobOrder.delete, "joborder")
}

export function useGetJobOrderDetails(id: string) {
  return useGetById<IJobOrderHd>(JobOrder.getDetails, "joborderdetails", id)
}

export function useSaveJobOrderDetails() {
  return useSave<IJobOrderHd>(JobOrder.saveDetails, "joborderdetails")
}
