import { useMemo } from "react"
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
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch if data is fresh
  })
}

// Get default values for a specific task
export const useTaskServiceDefaults = (taskId: number) => {
  const { data, isLoading, error } = useTaskServiceGet()

  const defaults = useMemo((): Record<string, number> => {
    if (!data?.data) return {}

    const taskSettings = data.data.find(
      (settings: ITaskService) => settings.taskId === taskId
    )
    if (!taskSettings) return {}

    return {
      chargeId: taskSettings.chargeId || 0,
      forkliftChargeId: taskSettings.forkliftChargeId || 0,
      stevedoreChargeId: taskSettings.stevedoreChargeId || 0,
      uomId: taskSettings.uomId || 0,
      taskStatusId: taskSettings.taskStatusId || 2, // Default status
      carrierId: taskSettings.carrierId || 0,
      serviceModeId: taskSettings.serviceModeId || 0,
      consignmentTypeId: taskSettings.consignmentTypeId || 0,
      visaId: taskSettings.visaId || 0,
      landingTypeId: taskSettings.landingTypeId || 0,
    }
  }, [data?.data, taskId])

  return {
    defaults,
    isLoading,
    error,
    hasDefaults: Object.values(defaults).some((value) => value !== 0),
  }
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
