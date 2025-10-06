import { ITaskDetails } from "@/interfaces/checklist"
import { CopyRate, ITariff } from "@/interfaces/tariff"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { getById, getData, saveData } from "@/lib/api-client"
import { Tariff } from "@/lib/api-routes"
/**
 * Query Configuration
 */
const defaultQueryConfig = {
  staleTime: 60 * 60 * 1000, // 1 hour
  refetchOnWindowFocus: false,
}
/**
 * Error Handler
 */
const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<{ message: string }>
    throw new Error(axiosError.response?.data?.message || "An error occurred")
  }
  throw error
}
/**
 * 1. Tariff Count Management
 * -------------------------
 * 1.1 Get Tariff Count
 * @param {number} customerId - Customer ID
 * @param {number} portId - Port ID
 * @returns {object} Query object containing tariff count data
 */
export function useGetTariffCount(customerId: number, portId: number) {
  return useQuery<{
    result: number
    message: string
    data: ITaskDetails
    totalRecords: number
  }>({
    queryKey: ["tariffCount", customerId, portId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(
          `${Tariff.getTariffCount}/${customerId}/${portId}`
        )
        return data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId > 0 && portId > 0,
  })
}
/**
 * 1.2 Get Tariff By Task
 * @param {number} customerId - Customer ID
 * @param {number} portId - Port ID
 * @param {number} taskId - Task ID
 * @param {boolean} hasSearched - Whether search has been performed
 * @returns {object} Query object containing tariff data by task
 */
export function useGetTariffByTask(
  customerId: number,
  portId: number,
  taskId: number,
  hasSearched: boolean
) {
  return useQuery<{
    result: number
    message: string
    data: ITariff[]
    totalRecords: number
  }>({
    queryKey: ["tariffByTask", customerId, portId, taskId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getById(
          `${Tariff.getTariffByTask}/${customerId}/${portId}/${taskId}`
        )
        return data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId > 0 && portId > 0 && hasSearched,
  })
}
/**
 * 2. Direct API Call Functions
 * ---------------------------
 * 2.1 Save Tariff Direct
 * @param {Partial<ITariff>} tariffData - Tariff data to save
 * @returns {Promise} Promise containing save response
 */
export const saveTariffDirect = async (tariffData: Partial<ITariff>) => {
  try {
    const response = await saveData(Tariff.add, tariffData)
    return response
  } catch (error) {
    console.error("Error saving tariff:", error)
    throw error
  }
}
/**
 * 2.2 Update Tariff Direct
 * @param {Partial<ITariff>} tariffData - Tariff data to update
 * @returns {Promise} Promise containing update response
 */
export const updateTariffDirect = async (tariffData: Partial<ITariff>) => {
  try {
    const response = await saveData(Tariff.add, tariffData)
    return response
  } catch (error) {
    console.error("Error updating tariff:", error)
    throw error
  }
}
/**
 * 2.3 Delete Tariff Direct
 * @param {string} tariffId - Tariff ID to delete
 * @returns {Promise} Promise containing delete response
 */
export const deleteTariffDirect = async (tariffId: string) => {
  try {
    const response = await getData(`${Tariff.delete}/${tariffId}`)
    return response
  } catch (error) {
    console.error("Error deleting tariff:", error)
    throw error
  }
}
/**
 * 3. Copy Rate Management
 * ----------------------
 * 3.1 Copy Rate Direct
 * @param {CopyRate} copyData - Copy rate data
 * @returns {Promise} Promise containing copy response
 */
export const copyRateDirect = async (copyData: CopyRate) => {
  try {
    const response = await saveData(Tariff.copy, copyData)
    return response
  } catch (error) {
    console.error("Error copying rate:", error)
    throw error
  }
}
/**
 * 3.2 Copy Company Tariff Direct
 * @param {CopyRate} copyData - Copy company tariff data
 * @returns {Promise} Promise containing copy response
 */
export const copyCompanyTariffDirect = async (copyData: CopyRate) => {
  try {
    const response = await saveData(Tariff.copyCompanyTariff, copyData)
    return response
  } catch (error) {
    console.error("Error copying company tariff:", error)
    throw error
  }
}
