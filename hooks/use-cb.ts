import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import {
  CbBankTransfer,
  CbBatchPayment,
  CbPayment,
  CbReceipt,
} from "@/lib/api-routes"

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
    ...options,
  })
}
