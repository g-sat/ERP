import {
  IGLPeriodClose,
  IGLPeriodCloseBulkAction,
  IGLPeriodCloseSummary,
} from "@/interfaces/gl-period-close"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { GLPeriodClose } from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  useSave,
  useUpdate,
} from "@/hooks/use-common"

// Hook for fetching period close data
export function useGetGLPeriodClose(filters?: string) {
  return useGet<IGLPeriodClose[]>(GLPeriodClose.get, "gl-period-close", filters)
}

// Hook for fetching period close by ID
export function useGetGLPeriodCloseById(periodId: string | undefined) {
  return useGetById<IGLPeriodClose>(
    GLPeriodClose.getById,
    "gl-period-close",
    periodId || "",
    {
      enabled: !!periodId && periodId !== "0",
    }
  )
}

// Hook for fetching period close by year
export function useGetGLPeriodCloseByYear(year: number | undefined) {
  return useGetByParams<IGLPeriodClose[]>(
    GLPeriodClose.get,
    "gl-period-close-by-year",
    year?.toString() || "",
    {
      enabled: !!year && year >= 2020,
    }
  )
}

// Hook for fetching period close by company and year
export function useGetGLPeriodCloseByCompanyYear(
  companyId: string | undefined,
  year: number | undefined
) {
  return useGetByParams<IGLPeriodClose[]>(
    GLPeriodClose.get,
    "gl-period-close-by-company-year",
    `${companyId}/${year}`,
    {
      enabled: !!companyId && !!year && year >= 2020,
    }
  )
}

// Hook for saving period close
export function useSaveGLPeriodClose() {
  const queryClient = useQueryClient()
  const saveMutation = useSave<IGLPeriodClose>(GLPeriodClose.post)

  return {
    ...saveMutation,
    mutate: (data: Partial<IGLPeriodClose>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-company-year"],
            })
          }
        },
      })
    },
  }
}

// Hook for updating period close
export function useUpdateGLPeriodClose() {
  const queryClient = useQueryClient()
  const updateMutation = useUpdate<IGLPeriodClose>(GLPeriodClose.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<IGLPeriodClose>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-company-year"],
            })
          }
        },
      })
    },
  }
}

// Hook for deleting period close
export function useDeleteGLPeriodClose() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(GLPeriodClose.delete)

  return {
    ...deleteMutation,
    mutate: (periodId: string) => {
      deleteMutation.mutate(periodId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-company-year"],
            })
          }
        },
      })
    },
  }
}

// Hook for bulk actions (close/reopen modules)
export function useGLPeriodCloseBulkAction() {
  const queryClient = useQueryClient()
  const bulkActionMutation = useSave<IGLPeriodCloseBulkAction>(
    GLPeriodClose.bulkAction
  )

  return {
    ...bulkActionMutation,
    mutate: (data: IGLPeriodCloseBulkAction) => {
      bulkActionMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-company-year"],
            })
          }
        },
      })
    },
  }
}

// Hook for fetching period close summary
export function useGetGLPeriodCloseSummary(companyId: string | undefined) {
  return useGetByParams<IGLPeriodCloseSummary>(
    GLPeriodClose.summary,
    "gl-period-close-summary",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
    }
  )
}

// Hook for closing specific module
export function useCloseGLPeriodModule() {
  const queryClient = useQueryClient()
  const closeMutation = useUpdate<IGLPeriodClose>(GLPeriodClose.put)

  const closeModule = (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    closeBy: string,
    includeVat: boolean = false
  ) => {
    const updateData: Partial<IGLPeriodClose> = {
      id: periodId,
    }

    switch (module) {
      case "AR":
        updateData.arClosed = true
        updateData.arCloseBy = closeBy
        updateData.arCloseDate = new Date().toISOString()
        if (includeVat) {
          updateData.arVatClosed = true
        }
        break
      case "AP":
        updateData.apClosed = true
        updateData.apCloseBy = closeBy
        updateData.apCloseDate = new Date().toISOString()
        if (includeVat) {
          updateData.apVatClosed = true
        }
        break
      case "CB":
        updateData.cbClosed = true
        updateData.cbCloseBy = closeBy
        updateData.cbCloseDate = new Date().toISOString()
        break
      case "GL":
        updateData.glClosed = true
        updateData.glCloseBy = closeBy
        updateData.glCloseDate = new Date().toISOString()
        break
    }

    closeMutation.mutate(updateData, {
      onSuccess: (response) => {
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
          queryClient.invalidateQueries({
            queryKey: ["gl-period-close-by-year"],
          })
          queryClient.invalidateQueries({
            queryKey: ["gl-period-close-by-company-year"],
          })
        }
      },
    })
  }

  const reopenModule = (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    reopenBy: string
  ) => {
    const updateData: Partial<IGLPeriodClose> = {
      id: periodId,
    }

    switch (module) {
      case "AR":
        updateData.arClosed = false
        updateData.arVatClosed = false
        updateData.arCloseBy = reopenBy
        updateData.arCloseDate = undefined
        break
      case "AP":
        updateData.apClosed = false
        updateData.apVatClosed = false
        updateData.apCloseBy = reopenBy
        updateData.apCloseDate = undefined
        break
      case "CB":
        updateData.cbClosed = false
        updateData.cbCloseBy = reopenBy
        updateData.cbCloseDate = undefined
        break
      case "GL":
        updateData.glClosed = false
        updateData.glCloseBy = reopenBy
        updateData.glCloseDate = undefined
        break
    }

    closeMutation.mutate(updateData, {
      onSuccess: (response) => {
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
          queryClient.invalidateQueries({
            queryKey: ["gl-period-close-by-year"],
          })
          queryClient.invalidateQueries({
            queryKey: ["gl-period-close-by-company-year"],
          })
        }
      },
    })
  }

  return {
    closeModule,
    reopenModule,
    isClosing: closeMutation.isPending,
  }
}

// Hook for generating periods for a year
export function useGenerateGLPeriods() {
  const queryClient = useQueryClient()
  const generateMutation = useSave<{ companyId: string; year: number }>(
    GLPeriodClose.post
  )

  return {
    ...generateMutation,
    mutate: (data: { companyId: string; year: number }) => {
      generateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-period-close"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-period-close-by-company-year"],
            })
          }
        },
      })
    },
  }
}
