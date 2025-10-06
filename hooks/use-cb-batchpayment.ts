import { ApiResponse } from "@/interfaces/auth"
import {
  ICBBatchPaymentFilter,
  ICBBatchPaymentHd,
} from "@/interfaces/cb-batchpayment"
import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import { apiClient, getById, getData, saveData } from "@/lib/api-client"

// ==================== TYPES ====================
type QueryParams = {
  searchString?: string
  pageNumber?: string
  pageSize?: string
  startDate?: string
  endDate?: string
  sortOrder?: string
  sortBy?: string
}

const baseQueryConfig = {
  pageNumber: "1",
  pageSize: "2000",
}

// ==================== QUERY HOOKS ====================

const cleanUrl = (url: string) => url.replace(/\/+/g, "/")

/**
 * Get all CB Batch Payments with filters
 */
export function useGetCBBatchPayments(
  companyId: number,
  filters?: ICBBatchPaymentFilter,
  options?: UseQueryOptions<ApiResponse<ICBBatchPaymentHd[]>>
) {
  return useQuery<ApiResponse<ICBBatchPaymentHd[]>>({
    queryKey: ["cb-batchpayments", companyId, filters],
    queryFn: async () => {
      const params: QueryParams = {
        ...baseQueryConfig,
        searchString: filters?.search?.trim() || "",
        startDate: filters?.startDate
          ? new Date(filters.startDate).toISOString().split("T")[0]
          : "",
        endDate: filters?.endDate
          ? new Date(filters.endDate).toISOString().split("T")[0]
          : "",
        sortOrder: filters?.sortOrder || "desc",
        sortBy: filters?.sortBy || "trnDate",
      }
      return await getData(`/cb-batchpayment/${companyId}`, params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  })
}

/**
 * Get CB Batch Payment by ID
 */
export function useGetCBBatchPaymentById(
  companyId: number,
  paymentId: string,
  options?: UseQueryOptions<ApiResponse<ICBBatchPaymentHd>>
) {
  return useQuery<ApiResponse<ICBBatchPaymentHd>>({
    queryKey: ["cb-batchpayment", companyId, paymentId],
    queryFn: async () =>
      await getById(`/cb-batchpayment/${companyId}/${paymentId}`),
    enabled: !!paymentId?.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  })
}

/**
 * Get CB Batch Payment with date range filters
 */
export function useGetCBBatchPaymentsWithDates(
  companyId: number,
  filters?: ICBBatchPaymentFilter,
  startDate?: string,
  endDate?: string,
  options?: UseQueryOptions<ApiResponse<ICBBatchPaymentHd[]>>
) {
  return useQuery<ApiResponse<ICBBatchPaymentHd[]>>({
    queryKey: [
      "cb-batchpayments-dates",
      companyId,
      filters,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params: QueryParams = {
        ...baseQueryConfig,
        searchString: filters?.search?.trim() || "",
        startDate: startDate?.trim() || "",
        endDate: endDate?.trim() || "",
        sortOrder: filters?.sortOrder || "desc",
        sortBy: filters?.sortBy || "trnDate",
      }
      return await getData(`/cb-batchpayment/${companyId}`, params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  })
}

// ==================== MUTATION HOOKS ====================

const handleMutationResponse = (response: ApiResponse<unknown>) => {
  if (response.result === 1) {
    toast.success(response.message || "Operation succeeded")
  } else {
    toast.error(response.message || "Operation failed")
  }
}

const handleMutationError = (error: AxiosError<{ message?: string }>) => {
  toast.error(error.response?.data?.message || "An error occurred")
}

/**
 * Create/Update CB Batch Payment
 */
export function usePersistCBBatchPayment(companyId: number) {
  return useMutation<
    ApiResponse<ICBBatchPaymentHd>,
    AxiosError<{ message?: string }>,
    Partial<ICBBatchPaymentHd>
  >({
    mutationFn: async (data) =>
      await saveData(`/cb-batchpayment/${companyId}`, data),
    onSuccess: handleMutationResponse,
    onError: handleMutationError,
  })
}

/**
 * Delete CB Batch Payment
 */
export function useDeleteCBBatchPayment(companyId: number) {
  return useMutation<
    ApiResponse<unknown>,
    AxiosError<{ message?: string }>,
    string
  >({
    mutationFn: async (paymentId) => {
      const response = await apiClient.delete(
        `/cb-batchpayment/${companyId}/${paymentId}`
      )
      return response.data
    },
    onSuccess: handleMutationResponse,
    onError: handleMutationError,
  })
}

/**
 * Cancel CB Batch Payment
 */
export function useCancelCBBatchPayment(companyId: number) {
  return useMutation<
    ApiResponse<unknown>,
    AxiosError<{ message?: string }>,
    { paymentId: string; cancelRemarks: string }
  >({
    mutationFn: async ({ paymentId, cancelRemarks }) => {
      const response = await apiClient.post(
        `/cb-batchpayment/${companyId}/${paymentId}/cancel`,
        {
          cancelRemarks,
        }
      )
      return response.data
    },
    onSuccess: handleMutationResponse,
    onError: handleMutationError,
  })
}

/**
 * Approve CB Batch Payment
 */
export function useApproveCBBatchPayment(companyId: number) {
  return useMutation<
    ApiResponse<unknown>,
    AxiosError<{ message?: string }>,
    string
  >({
    mutationFn: async (paymentId) => {
      const response = await apiClient.post(
        `/cb-batchpayment/${companyId}/${paymentId}/approve`
      )
      return response.data
    },
    onSuccess: handleMutationResponse,
    onError: handleMutationError,
  })
}
