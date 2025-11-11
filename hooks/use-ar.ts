import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getById, getData } from "@/lib/api-client"
import {
  ArAdjustment,
  ArCreditNote,
  ArDebitNote,
  ArDocSetOff,
  ArInvoice,
  ArReceipt,
  ArRefund,
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
 * 1.2 Get AR Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetARInvoiceHistoryList<T>(invoiceId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-invoice-history-list", invoiceId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArInvoice.history}/${invoiceId}`)
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
 * 1.3 Get AR Invoice History Details
 * @param {string} invoiceId - Invoice ID
 * @param {string} editVersion - Edit version
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history details
 */
export function useGetARInvoiceHistoryDetails<T>(
  invoiceId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-invoice-history-details", invoiceId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArInvoice.historyDetails}/${invoiceId}/${editVersion}`
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
 * 1.2 Get AR Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetARCreditNoteHistoryList<T>(
  creditNoteId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-creditnote-history-list", creditNoteId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArCreditNote.history}/${creditNoteId}`)
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
 * 1.3 Get AR Invoice History Details
 * @param {string} invoiceId - Invoice ID
 * @param {string} editVersion - Edit version
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history details
 */
export function useGetARCreditNoteHistoryDetails<T>(
  creditNoteId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-creditnote-history-details", creditNoteId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArCreditNote.historyDetails}/${creditNoteId}/${editVersion}`
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
 * 1.2 Get AR Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetARDebitNoteHistoryList<T>(
  debitNoteId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-debitnote-history-list", debitNoteId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArDebitNote.history}/${debitNoteId}`)
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
 * 1.3 Get AR Invoice History Details
 * @param {string} invoiceId - Invoice ID
 * @param {string} editVersion - Edit version
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history details
 */
export function useGetARDebitNoteHistoryDetails<T>(
  debitNoteId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-debitnote-history-details", debitNoteId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArDebitNote.historyDetails}/${debitNoteId}/${editVersion}`
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
 * 1.4 Get AR Adjustment History List
 */
export function useGetARAdjustmentHistoryList<T>(
  adjustmentId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-adjustment-history-list", adjustmentId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArAdjustment.history}/${adjustmentId}`)
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
 * 1.5 Get AR Adjustment History Details
 */
export function useGetARAdjustmentHistoryDetails<T>(
  adjustmentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-adjustment-history-details", adjustmentId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArAdjustment.historyDetails}/${adjustmentId}/${editVersion}`
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
 * 1.2 Get AR Receipt History List
 */
export function useGetARReceiptHistoryList<T>(receiptId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-receipt-history-list", receiptId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArReceipt.history}/${receiptId}`)
    },
    enabled: !!receiptId && receiptId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.3 Get AR Receipt History Details
 */
export function useGetARReceiptHistoryDetails<T>(
  receiptId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-receipt-history-details", receiptId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArReceipt.historyDetails}/${receiptId}/${editVersion}`
      )
    },
    enabled: !!receiptId && receiptId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 0,
    staleTime: 0,
    ...options,
  })
}

/**
 * 1.2 Get AR Refund History List
 */
export function useGetARRefundHistoryList<T>(refundId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-refund-history-list", refundId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArRefund.history}/${refundId}`)
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
 * 1.3 Get AR Refund History Details
 */
export function useGetARRefundHistoryDetails<T>(
  refundId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-refund-history-details", refundId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArRefund.historyDetails}/${refundId}/${editVersion}`
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
 * 1.2 Get AR DocSetOff History List
 */
export function useGetARDocSetOffHistoryList<T>(
  setoffId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-docsetoff-history-list", setoffId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${ArDocSetOff.history}/${setoffId}`)
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
 * 1.3 Get AR DocSetOff History Details
 */
export function useGetARDocSetOffHistoryDetails<T>(
  setoffId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["ar-docsetoff-history-details", setoffId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${ArDocSetOff.historyDetails}/${setoffId}/${editVersion}`
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
