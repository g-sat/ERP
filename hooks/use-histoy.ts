import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { HistoryDetails } from "@/lib/api-routes"

/**
 * 1. Base Configuration
 * --------------------
 * 1.1 API Proxy Configuration
 */
const apiProxy = axios.create({
  baseURL: "/api/proxy",
})

/**
 * 2. GL Posting Management
 * ----------------------
 * 2.1 Get GL Post Details
 * @param {number} moduleId - Module ID
 * @param {number} transactionId - Transaction ID
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing GL post details
 */
export function useGetGlPostDetails<T>(
  moduleId: number,
  transactionId: number,
  invoiceId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-post-details", moduleId, transactionId, invoiceId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const response = await apiProxy.get<ApiResponse<T>>(
        `${HistoryDetails.getGlPostingDetails}/${moduleId}/${transactionId}/${invoiceId}`
      )
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 3. Payment Management
 * -------------------
 * 3.1 Get Payment Details
 * @param {number} moduleId - Module ID
 * @param {number} transactionId - Transaction ID
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing payment details
 */
export function useGetPaymentDetails<T>(
  moduleId: number,
  transactionId: number,
  invoiceId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["payment-details", moduleId, transactionId, invoiceId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const response = await apiProxy.get<ApiResponse<T>>(
        `${HistoryDetails.getPaymentDetails}/${moduleId}/${transactionId}/${invoiceId}`
      )
      return response.data
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}
