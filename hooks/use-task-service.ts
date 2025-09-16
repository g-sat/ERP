import { IApiSuccessResponse } from "@/interfaces/auth"
import { ITaskService } from "@/interfaces/task-service"
import { ServiceFieldValues } from "@/schemas/task-service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getData, saveData } from "@/lib/api-client"
import { TaskServiceSetting } from "@/lib/api-routes"

// Fetch task service settings
export const useTaskServiceGet = () => {
  return useQuery({
    queryKey: ["task-service-settings"],
    queryFn: async (): Promise<IApiSuccessResponse<ITaskService[]>> => {
      const data = await getData(TaskServiceSetting.get)
      return data
    },
  })
}

// Save task service settings
export const useTaskServiceSave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: ServiceFieldValues
    ): Promise<IApiSuccessResponse<{ success: boolean }>> => {
      const response = await saveData(TaskServiceSetting.add, data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-service-settings"] })
    },
  })
}
