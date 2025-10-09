import { ApiResponse } from "@/interfaces/auth"
import { UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import { apiClient, getById, getData, saveData } from "@/lib/api-client"

// ==================== COMMON TYPES & CONFIGS ====================
type QueryParams = {
  searchString?: string
  pageNumber?: string
  pageSize?: string
  startDate?: string
  endDate?: string
}

const baseQueryConfig = {
  pageNumber: "1",
  pageSize: "2000",
}

interface GridLayoutData {
  companyId: number
  moduleId: number
  transactionId: number
  grdName: string
  grdKey: string
  grdColVisible: string
  grdColOrder: string
  grdSort: string
  grdString: string
}

// ==================== QUERY HOOKS ====================

const cleanUrl = (url: string) => url.replace(/\/+/g, "/")

/**
 * Base GET hook with filters
 */
export function useGet<T>(
  baseUrl: string,
  queryKey: string,
  filters?: string,
  options?: UseQueryOptions<ApiResponse<T>>
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      const params: QueryParams = {
        ...baseQueryConfig,
        searchString: filters?.trim() || "null",
      }
      return await getData(cleanUrl(baseUrl), params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    ...options,
  })
}

/**
 * GET by ID hook
 */
export function useGetById<T>(
  baseUrl: string,
  queryKey: string,
  id: string,
  options?: UseQueryOptions<ApiResponse<T>>
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, id],
    queryFn: async () => await getById(`${cleanUrl(baseUrl)}/${id}`),
    enabled: !!id?.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    ...options,
  })
}

/**
 * GET with path parameter
 */
export function useGetByPath<T>(
  baseUrl: string,
  queryKey: string,
  path?: string,
  filters?: string,
  options?: UseQueryOptions<ApiResponse<T>>
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, path, filters],
    queryFn: async () => {
      const params: QueryParams = {
        ...baseQueryConfig,
        searchString: filters?.trim() || "null",
      }
      return await getData(`${cleanUrl(baseUrl)}/${path}`, params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    ...options,
  })
}

/**
 * GET with custom path parameters
 */
export function useGetByParams<T>(
  baseUrl: string,
  queryKey: string,
  params: string,
  options?: UseQueryOptions<ApiResponse<T>>
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, params],
    queryFn: async () => await getData(`${cleanUrl(baseUrl)}/${params}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    ...options,
  })
}

/**
 * GET with date range filters
 */
export function useGetWithDates<T>(
  baseUrl: string,
  queryKey: string,
  filters?: string,
  startDate?: string,
  endDate?: string,
  options?: UseQueryOptions<ApiResponse<T>>,
  enabled?: boolean
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, filters, startDate, endDate],
    queryFn: async () => {
      const params: QueryParams = {
        ...baseQueryConfig,
        searchString: filters?.trim() || "",
        startDate: startDate?.trim() || "",
        endDate: endDate?.trim() || "",
      }
      return await getData(cleanUrl(baseUrl), params)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    enabled: enabled,
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
 * Create/Update hook
 */
export function usePersist<T>(baseUrl: string) {
  return useMutation<
    ApiResponse<T>,
    AxiosError<{ message?: string }>,
    Partial<T>
  >({
    mutationFn: async (data) => await saveData(cleanUrl(baseUrl), data),
    onSuccess: handleMutationResponse,
    onError: handleMutationError,
  })
}

/**
 * Delete hook
 */
export function useDelete<T = unknown>(baseUrl: string) {
  return useMutation<ApiResponse<T>, AxiosError<{ message?: string }>, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`${cleanUrl(baseUrl)}/${id}`)
      return response.data
    },
    onSuccess: handleMutationResponse,
    onError: handleMutationError,
  })
}

/**
 * Specialized grid layout update
 */
export function useUpdateGridLayout() {
  return useMutation({
    mutationFn: async (data: {
      data: GridLayoutData
      moduleId: number
      transactionId: number
    }) => await saveData("/setting/saveUserGrid", data),
    onSuccess: () => toast.success("Layout saved successfully!"),
    onError: (error: AxiosError) => {
      console.error("Error saving grid layout:", error)
      toast.error("Failed to save layout")
    },
  })
}
