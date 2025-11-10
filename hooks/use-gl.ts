import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { GLJournalEntry } from "@/lib/api-routes"

const NO_CACHE_QUERY_OPTIONS = {
  gcTime: 0,
  staleTime: 0,
}

// CB Gen Payment History Hooks
export function useGetGLJournalEntryHistoryList<T>(
  paymentId: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-journalentry-history-list", paymentId],
    queryFn: async () => {
      return await getData(`${GLJournalEntry.history}/${paymentId}`)
    },
    enabled: !!paymentId && paymentId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetGLJournalEntryHistoryDetails<T>(
  paymentId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-journalentry-history-details", paymentId, editVersion],
    queryFn: async () => {
      return await getData(
        `${GLJournalEntry.historyDetails}/${paymentId}/${editVersion}`
      )
    },
    enabled: !!paymentId && paymentId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}
