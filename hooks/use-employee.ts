import { ApiResponse } from "@/interfaces/auth"
import { IEmployee, IEmployeeBank } from "@/interfaces/employee"
import { EmployeeBankValues } from "@/schemas/employee"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getById, getData, saveData } from "@/lib/api-client"
import { Employee } from "@/lib/api-routes"

// Hook for fetching employee banks
export function useGetEmployeeBanks(employeeId: number | undefined) {
  return useQuery<ApiResponse<IEmployeeBank>>({
    queryKey: ["employee-banks", employeeId],
    queryFn: async () => {
      if (!employeeId) {
        return { result: 1, data: [], message: "No employee selected" }
      }
      return await getById(`${Employee.getBanks}?employeeId=${employeeId}`)
    },
    enabled: !!employeeId,
  })
}

// Hook for saving employee bank
export function useSaveEmployeeBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EmployeeBankValues) => {
      return await saveData(Employee.addBank, data)
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success(response.message || "Employee bank saved successfully")
        // Invalidate employee banks query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["employee-banks"] })
      } else {
        toast.error(response.message || "Failed to save employee bank")
      }
    },
    onError: (error) => {
      console.error("Error saving employee bank:", error)
      toast.error("Failed to save employee bank")
    },
  })
}

// Hook for updating employee bank
export function useUpdateEmployeeBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EmployeeBankValues) => {
      return await saveData(Employee.updateBank, data)
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success(response.message || "Employee bank updated successfully")
        // Invalidate employee banks query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["employee-banks"] })
      } else {
        toast.error(response.message || "Failed to update employee bank")
      }
    },
    onError: (error) => {
      console.error("Error updating employee bank:", error)
      toast.error("Failed to update employee bank")
    },
  })
}

// Hook for deleting employee bank
export function useDeleteEmployeeBank() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemNo: string) => {
      const response = await fetch(`${Employee.deleteBank}/${itemNo}`, {
        method: "DELETE",
      })
      return response.json()
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success(response.message || "Employee bank deleted successfully")
        // Invalidate employee banks query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["employee-banks"] })
      } else {
        toast.error(response.message || "Failed to delete employee bank")
      }
    },
    onError: (error) => {
      console.error("Error deleting employee bank:", error)
      toast.error("Failed to delete employee bank")
    },
  })
}

// Hook for checking employee code availability (duplicate detection)
export function useCheckEmployeeCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      return await getData(`${Employee.getByCode}/${code}`)
    },
    onError: (error) => {
      console.error("Error checking employee code:", error)
    },
  })
}

// Hook for checking employee category code availability
export function useCheckEmployeeCategoryCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      return await getData(`/master/getemployeecategorybycode/${code}`)
    },
    onError: (error) => {
      console.error("Error checking employee category code:", error)
    },
  })
}

// Hook for employee duplicate detection
export function useEmployeeDuplicateDetection() {
  const checkEmployeeCode = useCheckEmployeeCode()
  const checkEmployeeCategoryCode = useCheckEmployeeCategoryCode()

  const checkDuplicates = async (code: string) => {
    const trimmedCode = code?.trim()
    if (!trimmedCode) return { employee: null, category: null }

    try {
      const [employeeResponse, categoryResponse] = await Promise.all([
        checkEmployeeCode.mutateAsync(trimmedCode),
        checkEmployeeCategoryCode.mutateAsync(trimmedCode),
      ])

      return {
        employee:
          employeeResponse.data?.result === 1
            ? employeeResponse.data.data
            : null,
        category:
          categoryResponse.data?.result === 1
            ? categoryResponse.data.data
            : null,
      }
    } catch (error) {
      console.error("Error checking duplicates:", error)
      return { employee: null, category: null }
    }
  }

  return {
    checkDuplicates,
    isLoading:
      checkEmployeeCode.isPending || checkEmployeeCategoryCode.isPending,
  }
}

// Hook for employee photo upload (if needed for future enhancements)
export function useEmployeePhotoUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { employeeId: number; photo: string }) => {
      return await saveData(`${Employee.add}/photo`, data)
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success("Employee photo uploaded successfully")
        queryClient.invalidateQueries({ queryKey: ["employees"] })
      } else {
        toast.error(response.message || "Failed to upload employee photo")
      }
    },
    onError: (error) => {
      console.error("Error uploading employee photo:", error)
      toast.error("Failed to upload employee photo")
    },
  })
}

// Hook for employee bulk operations (future enhancement)
export function useEmployeeBulkOperations() {
  const queryClient = useQueryClient()

  const bulkDelete = useMutation({
    mutationFn: async (employeeIds: number[]) => {
      return await saveData(`${Employee.delete}/bulk`, { employeeIds })
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success("Employees deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["employees"] })
      } else {
        toast.error(response.message || "Failed to delete employees")
      }
    },
    onError: (error) => {
      console.error("Error bulk deleting employees:", error)
      toast.error("Failed to delete employees")
    },
  })

  const bulkUpdate = useMutation({
    mutationFn: async (data: {
      employeeIds: number[]
      updates: Partial<IEmployee>
    }) => {
      return await saveData(`${Employee.add}/bulk-update`, data)
    },
    onSuccess: (response) => {
      if (response.result === 1) {
        toast.success("Employees updated successfully")
        queryClient.invalidateQueries({ queryKey: ["employees"] })
      } else {
        toast.error(response.message || "Failed to update employees")
      }
    },
    onError: (error) => {
      console.error("Error bulk updating employees:", error)
      toast.error("Failed to update employees")
    },
  })

  return {
    bulkDelete,
    bulkUpdate,
  }
}
