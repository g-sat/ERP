import { IApiSuccessResponse } from "@/interfaces/auth"
import { ITaskService, ITaskServiceFormValues } from "@/interfaces/task-service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getData, saveData } from "@/lib/api-client"

// Fetch task service settings
export const useTaskServiceGet = () => {
  return useQuery({
    queryKey: ["task-service-settings"],
    queryFn: async (): Promise<IApiSuccessResponse<ITaskService[]>> => {
      const data = await getData("/setting/GetTaskServiceSetting")
      return data
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
      const response = await saveData("/setting/SaveTaskServiceSetting", data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-service-settings"] })
    },
  })
}
