import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getById, getData } from "@/lib/api-client"
import {
  CbBankRecon,
  CbBankTransfer,
  CbBankTransferCtm,
  CbGenPayment,
  CbGenReceipt,
  CbPettyCash,
} from "@/lib/api-routes"

/**
 * 1. CB Gen Payment Management
 * -------------------
 * 1.1 Get CB Gen Payment by ID
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {string} paymentId - Payment ID
 * @param {string} invoiceNo - Invoice number
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice data
 */
export function useGetCbGenPaymentById<T>(
  baseUrl: string,
  queryKey: string,
  paymentId: string,
  paymentNo: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, paymentId, paymentNo],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getById(`${cleanUrl}/${paymentId}/${paymentNo}`)
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
export function useGetCbGenPaymentHistoryList<T>(
  paymentId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genpayment-history-list", paymentId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${CbGenPayment.history}/${paymentId}`)
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
 * 1.3 Get AP Invoice History Details
 * @param {string} invoiceId - Invoice ID
 * @param {string} editVersion - Edit version
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history details
 */
export function useGetCbGenPaymentHistoryDetails<T>(
  paymentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genpayment-history-details", paymentId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${CbGenPayment.historyDetails}/${paymentId}/${editVersion}`
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
 * 1.2 Get AP Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetCbGenReceiptHistoryList<T>(
  receiptId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genreceipt-history-list", receiptId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${CbGenReceipt.history}/${receiptId}`)
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
 * 1.3 Get AP Invoice History Details
 * @param {string} invoiceId - Invoice ID
 * @param {string} editVersion - Edit version
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history details
 */
export function useGetCbGenReceiptHistoryDetails<T>(
  receiptId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genreceipt-history-details", receiptId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${CbGenReceipt.historyDetails}/${receiptId}/${editVersion}`
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
 * 1.2 Get AP Invoice History List
 * @param {string} invoiceId - Invoice ID
 * @param {object} options - Additional query options
 * @returns {object} Query object containing invoice history list
 */
export function useGetCbPettyCashHistoryList<T>(
  pettyCashId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-pettycash-history-list", pettyCashId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${CbPettyCash.history}/${pettyCashId}`)
    },
    enabled: !!pettyCashId && pettyCashId !== "0",
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
export function useGetCbPettyCashHistoryDetails<T>(
  pettyCashId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-pettycash-history-details", pettyCashId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${CbPettyCash.historyDetails}/${pettyCashId}/${editVersion}`
      )
    },
    enabled: !!pettyCashId && pettyCashId !== "0",
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
export function useGetCbBankHistoryList<T>(bankId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bank-history-list", bankId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${CbBankTransfer.history}/${bankId}`)
    },
    enabled: !!bankId && bankId !== "0",
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
export function useGetCbBankHistoryDetails<T>(
  bankId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bank-history-details", bankId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${CbBankTransfer.historyDetails}/${bankId}/${editVersion}`
      )
    },
    enabled: !!bankId && bankId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 1.4 Get AP Adjustment History List
 */
export function useGetCbBankTransferCtmHistoryList<T>(
  bankId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bank-transfer-ctm-history-list", bankId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${CbBankTransferCtm.history}/${bankId}`)
    },
    enabled: !!bankId && bankId !== "0",
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
export function useGetCbBankTransferCtmHistoryDetails<T>(
  bankId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bank-transfer-ctm-history-details", bankId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${CbBankTransferCtm.historyDetails}/${bankId}/${editVersion}`
      )
    },
    enabled: !!bankId && bankId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 1.4 Get AP Adjustment History List
 */
export function useGetCbBankReconHistoryList<T>(bankId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bank-recon-history-list", bankId],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(`${CbBankRecon.history}/${bankId}`)
    },
    enabled: !!bankId && bankId !== "0",
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
export function useGetCbBankReconHistoryDetails<T>(
  bankId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bank-recon-history-details", bankId, editVersion],
    queryFn: async () => {
      // Clean up the URL by removing any double slashes
      return await getData(
        `${CbBankRecon.historyDetails}/${bankId}/${editVersion}`
      )
    },
    enabled: !!bankId && bankId !== "0",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}
