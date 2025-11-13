import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getById, getData } from "@/lib/api-client"
import {
  ApAdjustment,
  ApCreditNote,
  ApDebitNote,
  ApDocSetOff,
  ApInvoice,
  ApPayment,
  ApRefund,
} from "@/lib/api-routes"

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
    gcTime: 0,
    staleTime: 0,
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
    gcTime: 0,
    staleTime: 0,
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
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.2 Get AP Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetAPCreditNoteHistoryList<T>(
  creditNoteId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-creditnote-history-list", creditNoteId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApCreditNote.history}/${creditNoteId}`)
    },
    enabled: !!creditNoteId && creditNoteId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
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
export function useGetAPCreditNoteHistoryDetails<T>(
  creditNoteId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-creditnote-history-details", creditNoteId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApCreditNote.historyDetails}/${creditNoteId}/${editVersion}`
      )
    },
    enabled: !!creditNoteId && creditNoteId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.2 Get AP Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetAPDebitNoteHistoryList<T>(
  debitNoteId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-debitnote-history-list", debitNoteId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApDebitNote.history}/${debitNoteId}`)
    },
    enabled: !!debitNoteId && debitNoteId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
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
export function useGetAPDebitNoteHistoryDetails<T>(
  debitNoteId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-debitnote-history-details", debitNoteId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApDebitNote.historyDetails}/${debitNoteId}/${editVersion}`
      )
    },
    enabled: !!debitNoteId && debitNoteId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.4 Get AP Adjustment History List
 */
export function useGetAPAdjustmentHistoryList<T>(
  adjustmentId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-adjustment-history-list", adjustmentId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApAdjustment.history}/${adjustmentId}`)
    },
    enabled: !!adjustmentId && adjustmentId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.5 Get AP Adjustment History Details
 */
export function useGetAPAdjustmentHistoryDetails<T>(
  adjustmentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-adjustment-history-details", adjustmentId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApAdjustment.historyDetails}/${adjustmentId}/${editVersion}`
      )
    },
    enabled: !!adjustmentId && adjustmentId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 1.2 Get AP Receipt History List
 */
export function useGetAPPaymentHistoryList<T>(paymentId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-payment-history-list", paymentId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApPayment.history}/${paymentId}`)
    },
    enabled: !!paymentId && paymentId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.3 Get AP Receipt History Details
 */
export function useGetAPPaymentHistoryDetails<T>(
  paymentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-payment-history-details", paymentId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApPayment.historyDetails}/${paymentId}/${editVersion}`
      )
    },
    enabled: !!paymentId && paymentId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.2 Get AP Refund History List
 */
export function useGetAPRefundHistoryList<T>(refundId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-refund-history-list", refundId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApRefund.history}/${refundId}`)
    },
    enabled: !!refundId && refundId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.3 Get AP Refund History Details
 */
export function useGetAPRefundHistoryDetails<T>(
  refundId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-refund-history-details", refundId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApRefund.historyDetails}/${refundId}/${editVersion}`
      )
    },
    enabled: !!refundId && refundId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.2 Get AP DocSetOff History List
 */
export function useGetAPDocSetOffHistoryList<T>(
  setoffId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-docsetoff-history-list", setoffId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ApDocSetOff.history}/${setoffId}`)
    },
    enabled: !!setoffId && setoffId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.3 Get AP DocSetOff History Details
 */
export function useGetAPDocSetOffHistoryDetails<T>(
  setoffId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ap-docsetoff-history-details", setoffId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ApDocSetOff.historyDetails}/${setoffId}/${editVersion}`
      )
    },
    enabled: !!setoffId && setoffId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}
