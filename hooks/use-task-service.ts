import { IApiSuccessResponse } from "@/interfaces/auth"
import { ITaskService, ITaskServiceFormValues } from "@/interfaces/task-service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { API_CONFIG, getSecureHeaders } from "@/lib/api-config"

// Fetch task service settings
export const useTaskServiceGet = () => {
  return useQuery({
    queryKey: ["task-service-settings"],
    queryFn: async (): Promise<IApiSuccessResponse<ITaskService[]>> => {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/setting/GetTaskServiceSetting`,
        {
          headers: getSecureHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch task service settings: ${response.status}`
        )
      }

      const responseData = await response.json()
      return responseData
    },
  })
}

// Save task service settings
export const useTaskServiceSave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: ITaskServiceFormValues
    ): Promise<IApiSuccessResponse<{ success: boolean }>> => {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/setting/SaveTaskServiceSetting`,
        {
          method: "POST",
          headers: getSecureHeaders(),
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to save task service settings: ${response.status}`
        )
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-service-settings"] })
    },
  })
}
