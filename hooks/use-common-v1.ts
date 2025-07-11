import { ApiResponse } from "@/interfaces/auth"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"

const apiProxy = axios.create({
  baseURL: "/api/proxy",
})

/**
 * 1. Common Query Hooks
 * --------------------
 * 1.1 Get Data Hook
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {string} filters - Optional filter string
 * @returns {object} Query object containing the data
 */
export function useGet<T>(
  baseUrl: string,
  queryKey: string,
  companyId: string,
  filters?: string
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      const response = await apiProxy.get<ApiResponse<T>>(`${cleanUrl}`, {
        headers: {
          "X-Company-Id": companyId,
          "Content-Type": "application/json",
          "X-Page-Number": "1",
          "X-Page-Size": "2000",
          "X-Search-String":
            filters && filters.trim() !== "" ? filters : "null",
        },
      })
      return response.data
    },
    // Cache disabled
    // refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchOnReconnect: false,
    // gcTime: 10 * 60 * 1000,
    // staleTime: 5 * 60 * 1000,
  })
}

/**
 * 1.2 Get Header Data Hook
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {string} filters - Optional filter string
 * @param {string} fromDate - Optional start date
 * @param {string} toDate - Optional end date
 * @returns {object} Query object containing the header data
 */
export function useGetHeader<T>(
  baseUrl: string,
  queryKey: string,
  companyId: string,
  filters?: string,
  fromDate?: string,
  toDate?: string
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      const response = await apiProxy.get<ApiResponse<T>>(`${cleanUrl}`, {
        headers: {
          "X-Company-Id": companyId,
          "Content-Type": "application/json",
          "X-Page-Number": "1",
          "X-Page-Size": "2000",
          "X-Search-String": filters && filters.trim() !== "" ? filters : "",
          "X-From-Date": fromDate && fromDate.trim() !== "" ? fromDate : "",
          "X-To-Date": toDate && toDate.trim() !== "" ? toDate : "",
        },
      })
      return response.data
    },
    // Cache disabled
    // refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchOnReconnect: false,
    // gcTime: 10 * 60 * 1000,
    // staleTime: 5 * 60 * 1000,
  })
}

/**
 * 1.3 Get Data by ID Hook
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {string} id - ID of the item to fetch
 * @param {object} options - Additional query options
 * @returns {object} Query object containing the data
 */
export function useGetById<T>(
  baseUrl: string,
  queryKey: string,
  companyId: string,
  id: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, id],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      const response = await apiProxy.get<ApiResponse<T>>(`${cleanUrl}/${id}`, {
        headers: {
          "X-Company-Id": companyId,
          "Content-Type": "application/json",
        },
      })
      return response.data
    },
    // Cache disabled
    // refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchOnReconnect: false,
    // gcTime: 10 * 60 * 1000,
    // staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 2. Mutation Hooks
 * ----------------
 * 2.1 Save Data Hook
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @returns {object} Mutation object for saving data
 */
export function useSave<T>(
  baseUrl: string,
  queryKey: string,
  companyId: string
) {
  //const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newData: Partial<T>) => {
      const response = await apiProxy.post<ApiResponse<T>>(
        `${baseUrl}`,
        newData,
        {
          headers: {
            "X-Company-Id": companyId,
            "Content-Type": "application/json",
          },
        }
      )
      return response.data
    },
    // Cache invalidation disabled
    // onMutate: async () => {
    //   // Cancel any outgoing refetches
    //   await queryClient.cancelQueries({ queryKey: [queryKey] })
    //   // Snapshot the previous value
    //   const previousData = queryClient.getQueryData<ApiResponse<T>>([queryKey])
    //   return { previousData }
    // },
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

/**
 * 2.2 Update Data Hook
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @returns {object} Mutation object for updating data
 */
export function useUpdate<T>(
  baseUrl: string,
  queryKey: string,
  companyId: string
) {
  //const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updatedData: Partial<T>) => {
      const response = await apiProxy.post<ApiResponse<T>>(
        `${baseUrl}`,
        updatedData,
        {
          headers: {
            "X-Company-Id": companyId,
            "Content-Type": "application/json",
          },
        }
      )
      return response.data
    },
    // Cache invalidation disabled
    // onMutate: async () => {
    //   // Cancel any outgoing refetches
    //   await queryClient.cancelQueries({ queryKey: [queryKey] })
    //   // Snapshot the previous value
    //   const previousData = queryClient.getQueryData<ApiResponse<T>>([queryKey])
    //   return { previousData }
    // },
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

/**
 * 2.3 Delete Data Hook
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @returns {object} Mutation object for deleting data
 */
export function useDelete<
  T extends { id?: string | number; countryId?: string | number },
>(baseUrl: string, queryKey: string, companyId: string) {
  //const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiProxy.delete<ApiResponse<T>>(
        `${baseUrl}/${id}`,
        {
          headers: {
            "X-Company-Id": companyId,
            "Content-Type": "application/json",
          },
        }
      )
      return response.data
    },
    // Cache invalidation disabled
    // onMutate: async () => {
    //   // Cancel any outgoing refetches
    //   await queryClient.cancelQueries({ queryKey: [queryKey] })
    //   // Snapshot the previous value
    //   const previousData = queryClient.getQueryData<ApiResponse<T>>([queryKey])
    //   return { previousData }
    // },
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

/**
 * 3. Grid Layout Hooks
 * -------------------
 * 3.1 Update Grid Layout Hook
 * @returns {object} Mutation object for updating grid layout
 */
export function useUpdateGridLayout(companyId: string) {
  //const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      data,
      moduleId,
      transactionId,
    }: {
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
      const response = await apiProxy.post(`/setting/saveUserGrid`, data, {
        headers: {
          "X-Company-Id": companyId,
          "Content-Type": "application/json",
          moduleId: moduleId.toString(),
          transactionId: transactionId.toString(),
        },
      })
      return response.data
    },
    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ["grid-layout-config"] })
      toast.success("Layout saved successfully!")
    },
    onError: (error: AxiosError) => {
      console.error("Error saving grid layout:", error)
      toast.error("Failed to save layout")
    },
  })
}
