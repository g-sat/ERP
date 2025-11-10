import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import {
  CbBankRecon,
  CbBankTransfer,
  CbBankTransferCtm,
  CbBatchPayment,
  CbPayment,
  CbPettyCash,
  CbReceipt,
} from "@/lib/api-routes"

const NO_CACHE_QUERY_OPTIONS = {
  gcTime: 0,
  staleTime: 0,
}

// CB Gen Payment History Hooks
export function useGetCBGenPaymentHistoryList<T>(
  paymentId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genpayment-history-list", paymentId],
    queryFn: async () => {
      return await getData(`${CbPayment.history}/${paymentId}`)
    },
    enabled: !!paymentId && paymentId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBGenPaymentHistoryDetails<T>(
  paymentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genpayment-history-details", paymentId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbPayment.historyDetails}/${paymentId}/${editVersion}`
      )
    },
    enabled: !!paymentId && paymentId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Gen Receipt History Hooks
export function useGetCBGenReceiptHistoryList<T>(
  receiptId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genreceipt-history-list", receiptId],
    queryFn: async () => {
      return await getData(`${CbReceipt.history}/${receiptId}`)
    },
    enabled: !!receiptId && receiptId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBGenReceiptHistoryDetails<T>(
  receiptId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-genreceipt-history-details", receiptId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbReceipt.historyDetails}/${receiptId}/${editVersion}`
      )
    },
    enabled: !!receiptId && receiptId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Batch Payment History Hooks
export function useGetCBBatchPaymentHistoryList<T>(
  paymentId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-batchpayment-history-list", paymentId],
    queryFn: async () => {
      return await getData(`${CbBatchPayment.history}/${paymentId}`)
    },
    enabled: !!paymentId && paymentId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBBatchPaymentHistoryDetails<T>(
  paymentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-batchpayment-history-details", paymentId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbBatchPayment.historyDetails}/${paymentId}/${editVersion}`
      )
    },
    enabled: !!paymentId && paymentId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Gen Bank Transfer History Hooks
export function useGetCBBankTransferHistoryList<T>(
  transferId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-banktransfer-history-list", transferId],
    queryFn: async () => {
      return await getData(`${CbBankTransfer.history}/${transferId}`)
    },
    enabled: !!transferId && transferId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBBankTransferHistoryDetails<T>(
  transferId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-banktransfer-history-details", transferId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbBankTransfer.historyDetails}/${transferId}/${editVersion}`
      )
    },
    enabled: !!transferId && transferId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Gen Bank Transfer Ctm History Hooks
export function useGetCBBankTransferCtmHistoryList<T>(
  transferId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-banktransferctm-history-list", transferId],
    queryFn: async () => {
      return await getData(`${CbBankTransferCtm.history}/${transferId}`)
    },
    enabled: !!transferId && transferId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBBankTransferCtmHistoryDetails<T>(
  transferId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-banktransferctm-history-details", transferId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbBankTransferCtm.historyDetails}/${transferId}/${editVersion}`
      )
    },
    enabled: !!transferId && transferId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Gen Bank Recon History Hooks
export function useGetCBBankReconHistoryList<T>(reconId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bankrecon-history-list", reconId],
    queryFn: async () => {
      return await getData(`${CbBankRecon.history}/${reconId}`)
    },
    enabled: !!reconId && reconId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBBankReconHistoryDetails<T>(
  reconId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-bankrecon-history-details", reconId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbBankRecon.historyDetails}/${reconId}/${editVersion}`
      )
    },
    enabled: !!reconId && reconId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Gen Receipt History Hooks
export function useGetCBPettyCashHistoryList<T>(
  pettyCashId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-pettycash-history-list", pettyCashId],
    queryFn: async () => {
      return await getData(`${CbPettyCash.history}/${pettyCashId}`)
    },
    enabled: !!pettyCashId && pettyCashId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetCBPettyCashHistoryDetails<T>(
  pettyCashId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["cb-pettycash-history-details", pettyCashId, editVersion],
    queryFn: async () => {
      return await getData(
        `${CbPettyCash.historyDetails}/${pettyCashId}/${editVersion}`
      )
    },
    enabled: !!pettyCashId && pettyCashId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}
