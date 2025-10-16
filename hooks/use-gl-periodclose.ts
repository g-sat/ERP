import {
  IGLPeriodClose,
  IGLPeriodCloseBulkAction,
  IGLPeriodCloseSummary,
} from "@/interfaces/gl-periodclose"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { saveData } from "@/lib/api-client"
import { GLPeriodClose } from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"

// Hook for fetching period close data
export function useGetGLPeriodClose(filters?: string) {
  return useGet<IGLPeriodClose>(GLPeriodClose.get, "gl-periodclose", filters)
}

// Hook for fetching period close by ID
export function useGetGLPeriodCloseById(periodId: string | undefined) {
  return useGetById<IGLPeriodClose>(
    GLPeriodClose.getById,
    "gl-periodclose",
    periodId || "",
    {
      enabled: !!periodId && periodId !== "0",
      queryKey: ["gl-periodclose", periodId],
    }
  )
}

// Hook for fetching period close by year
export function useGetGLPeriodCloseByYear(year: number | undefined) {
  return useGetByParams<IGLPeriodClose>(
    GLPeriodClose.get,
    "gl-periodclose-by-year",
    year?.toString() || "",
    {
      enabled: !!year && year >= 2020,
      queryKey: ["gl-periodclose-by-year", year],
    }
  )
}

// Hook for fetching period close by company and year
export function useGetGLPeriodCloseByCompanyYear(year: number | undefined) {
  return useGetByParams<IGLPeriodClose>(
    GLPeriodClose.get,
    "gl-periodclose-by-company-year",
    `${year}`,
    {
      enabled: !!year && year >= 2020,
      queryKey: ["gl-periodclose-by-company-year", year],
    }
  )
}

// Hook for saving period close
export function useSaveGLPeriodClose() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<IGLPeriodClose>(GLPeriodClose.post)

  return {
    ...saveMutation,
    mutate: (data: Partial<IGLPeriodClose>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-company-year"],
            })
          }
        },
      })
    },
  }
}

// Hook for saving period close (alias for consistency with naming pattern)
export function useGLPeriodCloseSave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data }: { data: IGLPeriodClose[] }) => {
      try {
        return await saveData(GLPeriodClose.post, data)
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving period close data:", error)
          throw error.response?.data || "Error saving period close data."
        }
        throw error
      }
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
        queryClient.invalidateQueries({
          queryKey: ["gl-periodclose-by-year"],
        })
        queryClient.invalidateQueries({
          queryKey: ["gl-periodclose-by-company-year"],
        })
      }
    },
  })
}

// Hook for updating period close
export function useUpdateGLPeriodClose() {
  const queryClient = useQueryClient()
  const updateMutation = usePersist<IGLPeriodClose>(GLPeriodClose.put)

  return {
    ...updateMutation,
    mutate: (data: Partial<IGLPeriodClose>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-company-year"],
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
            queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-company-year"],
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
  const bulkActionMutation = usePersist<IGLPeriodCloseBulkAction>(
    GLPeriodClose.bulkAction
  )

  return {
    ...bulkActionMutation,
    mutate: (data: IGLPeriodCloseBulkAction) => {
      bulkActionMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-company-year"],
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
    "gl-periodclose-summary",
    companyId || "",
    {
      enabled: !!companyId && companyId.trim() !== "",
      queryKey: ["gl-periodclose-summary", companyId],
    }
  )
}

// Hook for closing specific module
export function useCloseGLPeriodModule() {
  const queryClient = useQueryClient()
  const closeMutation = usePersist<IGLPeriodClose>(GLPeriodClose.put)

  const closeModule = (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    closeBy: number,
    includeVat: boolean = false
  ) => {
    const updateData: Partial<IGLPeriodClose> = {}

    switch (module) {
      case "AR":
        updateData.isArClose = true
        updateData.arCloseById = closeBy
        updateData.arCloseDate = new Date().toISOString()
        break
      case "AP":
        updateData.isApClose = true
        updateData.apCloseById = closeBy
        updateData.apCloseDate = new Date().toISOString()
        break
      case "CB":
        updateData.isCbClose = true
        updateData.cbCloseById = closeBy
        updateData.cbCloseDate = new Date().toISOString()
        break
      case "GL":
        updateData.isGlClose = true
        updateData.glCloseById = closeBy
        updateData.glCloseDate = new Date().toISOString()
        break
    }

    closeMutation.mutate(updateData, {
      onSuccess: (response) => {
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
          queryClient.invalidateQueries({
            queryKey: ["gl-periodclose-by-year"],
          })
          queryClient.invalidateQueries({
            queryKey: ["gl-periodclose-by-company-year"],
          })
        }
      },
    })
  }

  const reopenModule = (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    reopenBy: number
  ) => {
    const updateData: Partial<IGLPeriodClose> = {}

    switch (module) {
      case "AR":
        updateData.isArClose = false
        updateData.arCloseById = reopenBy
        updateData.arCloseDate = undefined
        break
      case "AP":
        updateData.isApClose = false
        updateData.apCloseById = reopenBy
        updateData.apCloseDate = undefined
        break
      case "CB":
        updateData.isCbClose = false
        updateData.cbCloseById = reopenBy
        updateData.cbCloseDate = undefined
        break
      case "GL":
        updateData.isGlClose = false
        updateData.glCloseById = reopenBy
        updateData.glCloseDate = undefined
        break
    }

    closeMutation.mutate(updateData, {
      onSuccess: (response) => {
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
          queryClient.invalidateQueries({
            queryKey: ["gl-periodclose-by-year"],
          })
          queryClient.invalidateQueries({
            queryKey: ["gl-periodclose-by-company-year"],
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
  const generateMutation = usePersist<{ companyId: string; year: number }>(
    GLPeriodClose.post
  )

  return {
    ...generateMutation,
    mutate: (data: { companyId: string; year: number }) => {
      generateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["gl-periodclose"] })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-year"],
            })
            queryClient.invalidateQueries({
              queryKey: ["gl-periodclose-by-company-year"],
            })
          }
        },
      })
    },
  }
}
