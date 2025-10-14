import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { CbPayment, CbReceipt } from "@/lib/api-routes"

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
