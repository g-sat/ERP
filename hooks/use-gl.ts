import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { GLContra, GLJournal } from "@/lib/api-routes"

const NO_CACHE_QUERY_OPTIONS = {
  gcTime: 0,
  staleTime: 0,
}

// CB Gen Payment History Hooks
export function useGetGLJournalHistoryList<T>(journalId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-journalentry-history-list", journalId],
    queryFn: async () => {
      return await getData(`${GLJournal.history}/${journalId}`)
    },
    enabled: !!journalId && journalId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetGLJournalHistoryDetails<T>(
  journalId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-journalentry-history-details", journalId, editVersion],
    queryFn: async () => {
      return await getData(
        `${GLJournal.historyDetails}/${journalId}/${editVersion}`
      )
    },
    enabled: !!journalId && journalId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

// CB Gen Payment History Hooks
export function useGetGLContraHistoryList<T>(contraId: string, options = {}) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-arapcontra-history-list", contraId],
    queryFn: async () => {
      return await getData(`${GLContra.history}/${contraId}`)
    },
    enabled: !!contraId && contraId !== "0",
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}

export function useGetGLContraHistoryDetails<T>(
  contraId: string,
  editVersion: string,
  options = {}
) {
  return useQuery<ApiResponse<T>>({
    queryKey: ["gl-arapcontra-history-details", contraId, editVersion],
    queryFn: async () => {
      return await getData(
        `${GLContra.historyDetails}/${contraId}/${editVersion}`
      )
    },
    enabled: !!contraId && contraId !== "0" && !!editVersion,
    ...NO_CACHE_QUERY_OPTIONS,
    ...options,
  })
}
