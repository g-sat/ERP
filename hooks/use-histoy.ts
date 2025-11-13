import { ApiResponse } from "@/interfaces/auth"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { HistoryDetails } from "@/lib/api-routes"

/**
 * 1. GL Posting Management
 * ----------------------
 * 1.1 Get GL Post Details
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
      return await getData(
        `${HistoryDetails.getGlPostingDetails}/${moduleId}/${transactionId}/${invoiceId}`
      )
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 2. Payment Management
 * -------------------
 * 2.1 Get Payment Details
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
      return await getData(
        `${HistoryDetails.getPaymentDetails}/${moduleId}/${transactionId}/${invoiceId}`
      )
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 3. Customer Invoice Lookup
 * --------------------------
 * 3.1 Get customer invoices by customer and currency
 * @param {number} customerId - Customer ID
 * @param {number} currencyId - Currency ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice list
 */
export function useGetCustomerInvoices<T>(
  customerId?: number,
  currencyId?: number,
  options?: Partial<UseQueryOptions<ApiResponse<T>>>
) {
  const { enabled, ...restOptions } = options || {}

  const isBaseEnabled =
    !!customerId &&
    customerId > 0 &&
    !!currencyId &&
    currencyId > 0 &&
    (enabled ?? true)

  return useQuery<ApiResponse<T>>({
    queryKey: ["customer-invoices", customerId, currencyId],
    queryFn: async () => {
      return await getData(
        `${HistoryDetails.getCustomerInvoice}/${customerId}/${currencyId}`
      )
    },
    enabled: isBaseEnabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...restOptions,
  })
}

/**
 * 3. Customer Invoice Lookup
 * --------------------------
 * 3.1 Get customer invoices by customer and currency
 * @param {number} customerId - Customer ID
 * @param {number} currencyId - Currency ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice list
 */
export function useGetSupplierInvoices<T>(
  supplierId?: number,
  currencyId?: number,
  options?: Partial<UseQueryOptions<ApiResponse<T>>>
) {
  const { enabled, ...restOptions } = options || {}

  const isBaseEnabled =
    !!supplierId &&
    supplierId > 0 &&
    !!currencyId &&
    currencyId > 0 &&
    (enabled ?? true)

  return useQuery<ApiResponse<T>>({
    queryKey: ["supplier-invoices", supplierId, currencyId],
    queryFn: async () => {
      return await getData(
        `${HistoryDetails.getSupplierInvoice}/${supplierId}/${currencyId}`
      )
    },
    enabled: isBaseEnabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...restOptions,
  })
}
