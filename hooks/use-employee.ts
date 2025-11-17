import { ApiResponse } from "@/interfaces/auth"
import {
  IEmployee,
  IEmployeeBank,
  IEmployeeBasic,
  IEmployeePersonalDetails,
} from "@/interfaces/employee"
import { ISalaryComponent, ISalaryHistory } from "@/interfaces/payroll"
import { EmployeeBankValues, EmployeeBasicValues } from "@/schemas"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getById } from "@/lib/api-client"
import { Employee, SalaryComponent } from "@/lib/api-routes"
import { useDelete, useGet, useGetById, usePersist } from "@/hooks/use-common"

// Hook for fetching employee by userId
export function useGetEmployeeByUserId() {
  return useQuery<ApiResponse<IEmployee>>({
    queryKey: ["employee-by-user", ""],
    queryFn: async () => {
      return await getById(Employee.getByUserId)
    },
    enabled: true, // Always enabled to allow API call with empty string
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

// Hook for fetching employees
export function useGetEmployees(filters?: string) {
  return useGet<IEmployee[]>(Employee.get, "employees", filters)
}

// Hook for fetching employee by ID
export function useGetEmployeeById(employeeId: string | undefined) {
  return useGetById<IEmployee>(Employee.getById, "employee", employeeId || "")
}

// Hook for fetching employee basic information by ID
export function useGetEmployeeBasicById(employeeId: string | undefined) {
  return useGetById<IEmployeeBasic>(
    `${Employee.getById}`,
    "employee-basic",
    employeeId || ""
  )
}

// Hook for fetching employee personal details by ID
export function useGetEmployeePersonalDetailsById(
  employeeId: string | undefined
) {
  return useGetById<IEmployeePersonalDetails>(
    `${Employee.getPersonalById}`,
    "employee-personal",
    employeeId || ""
  )
}

// Hook for fetching employee bank information by ID
export function useGetEmployeeBankById(employeeId: string | undefined) {
  return useGetById<IEmployeeBank>(
    `${Employee.getBankById}`,
    "employee-bank",
    employeeId || ""
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

// Hook for saving employee basic information
export function useSaveEmployeeBasic() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<EmployeeBasicValues>(Employee.add)

  return {
    ...saveMutation,
    mutate: (data: Partial<EmployeeBasicValues>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            queryClient.invalidateQueries({ queryKey: ["employee-basic"] })
          }
        },
      })
    },
  }
}

// Hook for saving employee personal details
export function useSaveEmployeePersonalDetails() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<IEmployeePersonalDetails>(
    Employee.addPersonal
  )

  return {
    ...saveMutation,
    mutate: (data: Partial<IEmployeePersonalDetails>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            queryClient.invalidateQueries({ queryKey: ["employee-personal"] })
          }
        },
      })
    },
  }
}

// Hook for saving employee bank information
export function useSaveEmployeeBank() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<EmployeeBankValues>(Employee.addBank)

  return {
    ...saveMutation,
    mutate: (data: Partial<EmployeeBankValues>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            queryClient.invalidateQueries({ queryKey: ["employee-bank"] })
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

//salary details

// Hook for fetching employee salary details by ID
export function useGetEmployeeSalaryDetailsById(
  employeeId: string | undefined
) {
  return useGetById<ISalaryComponent>(
    `${SalaryComponent.getById}`,
    "employee-salary-details",
    employeeId || ""
  )
}

export function useGetEmployeeSalaryHistory(employeeId: string | undefined) {
  return useGetById<ISalaryHistory>(
    `${SalaryComponent.getHistoryById}`,
    "employee-salary-history",
    employeeId || ""
  )
}

// Hook for saving employee salary details
export function useSaveEmployeeSalaryDetails() {
  const queryClient = useQueryClient()
  const saveMutation = usePersist<ISalaryComponent[]>(`${SalaryComponent.add}`)

  return {
    ...saveMutation,
    mutate: (data: Partial<ISalaryComponent[]>) => {
      saveMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.result === 1) {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            queryClient.invalidateQueries({
              queryKey: ["employee-salary-details"],
            })
          }
        },
      })
    },
  }
}
