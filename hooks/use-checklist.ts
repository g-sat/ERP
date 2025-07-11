import { IJobOrderHd } from "@/interfaces/checklist"

import { JobOrder } from "@/lib/api-routes"

import { useDelete, useGet, useGetById, useSave, useUpdate } from "./use-common"

export function useGetJobOrders(filters?: string) {
  return useGet<IJobOrderHd>(JobOrder.get, "joborders", filters)
}

export function useGetJobOrderById(id: string) {
  return useGetById<IJobOrderHd>(JobOrder.getByIdNo, "joborder", id)
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
