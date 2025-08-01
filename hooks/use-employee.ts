import { IEmployee } from "@/interfaces/employee"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { Employee } from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"

// Hook for fetching employees
export function useGetEmployees(filters?: string) {
  return useGet<IEmployee[]>(Employee.get, "employees", filters)
}

// Hook for fetching employee by ID
export function useGetEmployeeById(employeeId: string | undefined) {
  return useGetById<IEmployee>(Employee.get, "employee", employeeId || "", {
    enabled: !!employeeId && employeeId !== "0",
  })
}

// Hook for fetching employee by code
export function useGetEmployeeByCode(employeeCode: string | undefined) {
  return useGetByParams<IEmployee>(
    Employee.getByCode,
    "employee-by-code",
    employeeCode || "",
    {
      enabled: !!employeeCode && employeeCode.trim() !== "",
    }
  )
}

// Hook for saving employee
export function useSaveEmployee() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<IEmployee>(Employee.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<IEmployee>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
          }
        },
      })
    },
  }
}

// Hook for updating employee
export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  const updateMutation = usePersist<IEmployee>(Employee.add)

  return {
    ...updateMutation,
    mutate: (data: Partial<IEmployee>) => {
      updateMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            queryClient.invalidateQueries({ queryKey: ["employee"] })
          }
        },
      })
    },
  }
}

// Hook for deleting employee
export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  const deleteMutation = useDelete(Employee.delete)

  return {
    ...deleteMutation,
    mutate: (employeeId: string) => {
      deleteMutation.mutate(employeeId, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
          }
        },
      })
    },
  }
}

// Hook for checking employee code availability (duplicate detection)
export function useCheckEmployeeCode() {
  return useGetByParams<IEmployee>(
    Employee.getByCode,
    "employee-code-check",
    "",
    {
      enabled: false, // Only run when explicitly called
    }
  )
}

// Hook for employee duplicate detection
export function useEmployeeDuplicateDetection() {
  const checkEmployeeCode = useCheckEmployeeCode()

  const checkDuplicates = async (code: string) => {
    const trimmedCode = code?.trim()
    if (!trimmedCode) return { employee: null }

    try {
      const employeeResponse = await getData(
        `${Employee.getByCode}/${trimmedCode}`
      )

      return {
        employee:
          employeeResponse.data?.result === 1
            ? employeeResponse.data.data
            : null,
      }
    } catch (error) {
      console.error("Error checking duplicates:", error)
      return { employee: null }
    }
  }

  return {
    checkDuplicates,
    isLoading: checkEmployeeCode.isLoading,
  }
}

// Hook for employee photo upload (if needed for future enhancements)
export function useEmployeePhotoUpload() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<{ employeeId: number; photo: string }>(
    `${Employee.add}/photo`
  )

  return {
    ...saveMutation,
    mutate: (data: { employeeId: number; photo: string }) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
          }
        },
      })
    },
  }
}

// Hook for employee bulk operations (future enhancement)
export function useEmployeeBulkOperations() {
  const queryClient = useQueryClient()

  const bulkDelete = usePersist<{ employeeIds: number[] }>(
    `${Employee.delete}/bulk`
  )
  const bulkUpdate = usePersist<{
    employeeIds: number[]
    updates: Partial<IEmployee>
  }>(`${Employee.add}/bulk-update`)

  return {
    bulkDelete: {
      ...bulkDelete,
      mutate: (employeeIds: number[]) => {
        bulkDelete.mutate(
          { employeeIds },
          {
            onSuccess: (response) => {
              if (response.result === 1) {
                queryClient.invalidateQueries({ queryKey: ["employees"] })
              }
            },
          }
        )
      },
    },
    bulkUpdate: {
      ...bulkUpdate,
      mutate: (data: {
        employeeIds: number[]
        updates: Partial<IEmployee>
      }) => {
        bulkUpdate.mutate(data, {
          onSuccess: (response) => {
            if (response.result === 1) {
              queryClient.invalidateQueries({ queryKey: ["employees"] })
            }
          },
        })
      },
    },
  }
}
