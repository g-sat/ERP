import { ApiResponse } from "@/interfaces/auth"
import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import { apiClient, getById, getData, saveData } from "@/lib/api-client"

export function useGet<T>(baseUrl: string, queryKey: string, filters?: string) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      const params = {
        searchString: filters && filters.trim() !== "" ? filters : "null",
        pageNumber: "1",
        pageSize: "2000",
      }
      return await getData(cleanUrl, params)
    },
  })
}

export function useGetHeader<T>(
  baseUrl: string,
  queryKey: string,
  filters?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      const params = {
        searchString: filters && filters.trim() !== "" ? filters : "",
        pageNumber: "1",
        pageSize: "2000",
        startDate: startDate && startDate.trim() !== "" ? startDate : "",
        endDate: endDate && endDate.trim() !== "" ? endDate : "",
      }
      return await getData(cleanUrl, params)
    },
  })
}

export function useGetById<T>(
  baseUrl: string,
  queryKey: string,
  id: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, id],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getById(`${cleanUrl}/${id}`)
    },
    enabled: !!id && id.trim() !== "", // Only run when id is not empty or null
    ...options,
  })
}

export function useGetByParams<T>(
  baseUrl: string,
  queryKey: string,
  params: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, params],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getData(`${cleanUrl}/${params}`)
    },
    ...options,
  })
}

export function useSave<T>(baseUrl: string) {
  return useMutation({
    mutationFn: async (newData: Partial<T>) => {
      return await saveData(baseUrl, newData)
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success(response.message || "Created successfully")
      } else {
        toast.error(response.message || "Creation failed")
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage = error.response?.data?.message || "An error occurred"
      toast.error(errorMessage)
    },
  })
}

export function useUpdate<T>(baseUrl: string) {
  return useMutation({
    mutationFn: async (updatedData: Partial<T>) => {
      return await saveData(baseUrl, updatedData)
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success(response.message || "Updated successfully")
      } else {
        toast.error(response.message || "Update failed")
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage = error.response?.data?.message || "An error occurred"
      toast.error(errorMessage)
    },
  })
}

export function useDelete(baseUrl: string) {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`${baseUrl}/${id}`)
      return response.data
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success(response.message || "Deleted successfully")
      } else {
        toast.error(response.message || "Deletion failed")
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const errorMessage = error.response?.data?.message || "An error occurred"
      toast.error(errorMessage)
    },
  })
}

export function useUpdateGridLayout() {
  return useMutation({
    mutationFn: async (data: {
      data: {
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
      moduleId: number
      transactionId: number
    }) => {
      return await saveData("/setting/saveUserGrid", data)
    },
    onSuccess: () => {
      toast.success("Layout saved successfully!")
    },
    onError: (error: AxiosError) => {
      console.error("Error saving grid layout:", error)
      toast.error("Failed to save layout")
    },
  })
}
