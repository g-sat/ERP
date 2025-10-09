import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getById, getData } from "@/lib/api-client"
import { ApInvoice } from "@/lib/api-routes"

/**
 * 1. Invoice Management
 * -------------------
 * 1.1 Get Invoice by ID
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {string} invoiceId - Invoice ID
 * @param {string} invoiceNo - Invoice number
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice data
 */
export function useGetInvoiceById<T>(
  baseUrl: string,
  queryKey: string,
  invoiceId: string,
  invoiceNo: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, invoiceId, invoiceNo],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getById(`${cleanUrl}/${invoiceId}/${invoiceNo}`)
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
 * 1.2 Get AP Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetAPInvoiceHistoryList<T>(invoiceId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-invoice-history-list", invoiceId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApInvoice.history}/${invoiceId}`)
    },
    enabled: !!invoiceId && invoiceId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 1.3 Get AP Invoice History Details
 * @param {string} invoiceId - Invoice ID
 * @param {string} editVersion - Edit version
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history details
 */
export function useGetAPInvoiceHistoryDetails<T>(
  invoiceId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-invoice-history-details", invoiceId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApInvoice.historyDetails}/${invoiceId}/${editVersion}`
      )
    },
    enabled: !!invoiceId && invoiceId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}
