import {
  ICloneUserGridSetting,
  IDecFormat,
  IDynmaicLookup,
  IFinance,
  IGridSetting,
  IMandatoryFields,
  IUserSetting,
  IVisibleFields,
} from "@/interfaces/setting"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import axios, { AxiosError } from "axios"

import {
  BasicSetting,
  DecimalSetting,
  DynamicLookupSetting,
  FinanceSetting,
  MandatoryFieldSetting,
  NumberFormat,
  UserGrid,
  UserSetting,
  VisibleFieldSetting,
} from "@/lib/api-routes"

const apiProxy = axios.create({
  baseURL: "/api/proxy",
})

// Common query configuration
const defaultQueryConfig = {
  staleTime: 60 * 60 * 1000, // 1 hour
  refetchOnWindowFocus: false,
}

// Generic error handler
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>
    throw new Error(axiosError.response?.data?.message || "An error occurred")
  }
  throw error
}

// =========================
// Decimal Setting Hooks
// =========================
// 1. Get Decimal Setting
export const useDecimalGet = () => {
  return useQuery({
    queryKey: ["decimal"],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(DecimalSetting.get)
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Decimal Setting
export const useDecimalSave = () => {
  return useMutation({
    mutationFn: async (data: IDecFormat) => {
      try {
        const response = await apiProxy.post(`${DecimalSetting.add}`, data)
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving decimal settings:", error)
          throw error.response?.data || "Error saving decimal settings."
        }
        throw error
      }
    },
  })
}
// End Decimal Setting Hooks

// =========================
// Finance Setting Hooks
// =========================
// 1. Get Finance Setting
export const useFinanceGet = () => {
  return useQuery({
    queryKey: ["Finance"],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(FinanceSetting.get)
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Finance Setting
export const useFinanceSave = () => {
  return useMutation({
    mutationFn: async (data: IFinance) => {
      try {
        const response = await apiProxy.post(`${FinanceSetting.add}`, data)
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving finance settings:", error)
          throw error.response?.data || "Error saving finance settings."
        }
        throw error
      }
    },
  })
}
// End Finance Setting Hooks

// =========================
// User Setting Hooks
// =========================
// 1. Get User Setting
export const useUserSettingGet = () => {
  return useQuery({
    queryKey: ["UserSetting"],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(UserSetting.get)
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save User Setting
export const useUserSettingSave = () => {
  return useMutation({
    mutationFn: async (data: IUserSetting) => {
      try {
        const response = await apiProxy.post(`${UserSetting.add}`, data)
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving user settings:", error)
          throw error.response?.data || "Error saving user settings."
        }
        throw error
      }
    },
  })
}
// End User Setting Hooks

// =========================
// Mandatory Field Setting Hooks
// =========================
// 1. Get Mandatory Fields by Module ID
export const useMandatoryFieldbyidGet = (moduleId: number) => {
  return useQuery({
    queryKey: ["mandatoryfield", moduleId],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${MandatoryFieldSetting.getV1}/${moduleId}`
      )
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Mandatory Field Settings
export const useMandatoryFieldSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: IMandatoryFields[] }) => {
      try {
        const response = await apiProxy.post(
          `${MandatoryFieldSetting.add}`,
          data
        )
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving mandatory field settings:", error)
          throw error.response?.data || "Error saving mandatory field settings."
        }
        throw error
      }
    },
  })
}
// End Mandatory Field Setting Hooks

// =========================
// Visible Field Setting Hooks
// =========================
// 1. Get Visible Fields by Module ID
export const useVisibleFieldbyidGet = (moduleId: number) => {
  return useQuery({
    queryKey: ["visiblefield", moduleId],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${VisibleFieldSetting.getV1}/${moduleId}`
      )
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Visible Field Settings
export const useVisibleFieldSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: IVisibleFields[] }) => {
      try {
        const response = await apiProxy.post(`${VisibleFieldSetting.add}`, data)
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving visible field settings:", error)
          throw error.response?.data || "Error saving visible field settings."
        }
        throw error
      }
    },
  })
}
// End Visible Field Setting Hooks

// =========================
// Dynamic Lookup Setting Hooks
// =========================
// 1. Get Dynamic Lookup Settings
export const useDynamicLookupGet = () => {
  return useQuery({
    queryKey: ["dynamiclookup"],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(DynamicLookupSetting.get)
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Dynamic Lookup Settings
export const useDynamicLookupSave = () => {
  return useMutation({
    mutationFn: async (data: IDynmaicLookup) => {
      try {
        const response = await apiProxy.post(
          `${DynamicLookupSetting.add}`,
          data
        )
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving dynamic lookup settings:", error)
          throw error.response?.data || "Error saving dynamic lookup settings."
        }
        throw error
      }
    },
  })
}
// End Dynamic Lookup Setting Hooks

// =========================
// Grid Setting Hooks
// =========================
// 1. Get Grid Setting by Module & Transaction ID
export const useGridSettingGet = (moduleId: number, transactionId: number) => {
  return useQuery<IGridSetting>({
    queryKey: ["gridSetting", moduleId, transactionId],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(`${UserGrid.get}`, {
        headers: {
          "Content-Type": "application/json",
          "X-Module-Id": moduleId.toString(),
          "X-Transaction-Id": transactionId.toString(),
        },
      })
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Grid Setting
export const useGridSettingSave = () => {
  return useMutation({
    mutationFn: async (data: IGridSetting) => {
      try {
        const response = await apiProxy.post(`${UserGrid.add}`, data)
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving grid settings:", error)
          throw error.response?.data || "Error saving grid settings."
        }
        throw error
      }
    },
  })
}
// End Grid Setting Hooks

// =========================
// User Grid Setting Hooks
// =========================
// 1. Get User Grid Settings by User ID
export const useUserGridSettingbyidGet = (userId: number, options = {}) => {
  return useQuery({
    queryKey: ["userGridSetting", userId],
    queryFn: async () => {
      const response = await apiProxy.get(`${UserGrid.getByUserId}/${userId}`)
      return response.data
    },
    enabled: userId > 0,
    ...options,
  })
}

// 2. Clone User Grid Settings
export const useCloneUserSettingSave = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ICloneUserGridSetting) => {
      const response = await apiProxy.post(
        `${UserGrid.clone}/${data.fromUserId}/${data.toUserId}`,
        data
      )
      return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  })
}
// End User Grid Setting Hooks

// =========================
// Number Format Hooks
// =========================
// 1. Get Module Transaction List
export const useModuleTransactionListGet = () => {
  return useQuery({
    queryKey: ["module-transaction-list"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(NumberFormat.getmodtrnslist)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

// 2. Get Number Format Data by Module & Transaction ID
export const useNumberFormatDataById = ({
  moduleId,
  transactionId,
}: {
  moduleId: number
  transactionId: number
}) => {
  return useQuery({
    queryKey: ["numberformatdata", moduleId, transactionId],
    staleTime: 0,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${NumberFormat.getById}/${moduleId}/${transactionId}`
      )
      return response.data
    },
    enabled: moduleId > 0 && transactionId > 0,
    refetchOnWindowFocus: true,
  })
}

// 3. Get Number Format Details by ID & Year
export const useNumberFormatDetailsDataGet = ({
  id,
  year,
}: {
  id: number
  year: number
}) => {
  return useQuery({
    queryKey: ["documentcount", id, year],
    staleTime: 600000,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${NumberFormat.getByYear}/${id}/${year}`
      )
      return response.data
    },
    enabled: id > 0 && year > 0,
    refetchOnWindowFocus: false,
  })
}

// 4. Save Number Format
export const useNumberFormatSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: unknown }) => {
      try {
        const response = await apiProxy.post(NumberFormat.add, data)
        return response.data
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving document number settings:", error)
          throw error.response?.data || "Error saving document number settings."
        }
        throw error
      }
    },
  })
}
// End Number Format Hooks

// =========================
// Grid Layout Hooks
// =========================
// 1. Get Grid Layout by Module, Transaction ID & Grid Name
export const useGetGridLayout = (
  moduleId: string,
  transactionId: string,
  gridName: string,
  companyId: string
) => {
  return useQuery({
    queryKey: ["grid-layout-config", moduleId, transactionId, gridName],
    ...defaultQueryConfig,
    queryFn: async () => {
      const response = await apiProxy.get(`${UserGrid.getV1}/${gridName}`, {
        headers: {
          "Content-Type": "application/json",
          "X-Module-Id": moduleId,
          "X-Transaction-Id": transactionId,
          "X-Company-Id": companyId,
        },
      })
      return response.data?.data
    },
    enabled: !!moduleId && !!transactionId,
  })
}

// 2. Update Grid Layout
export const useUpdateGridLayout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      data,
      moduleId,
      transactionId,
    }: {
      data: Record<string, unknown>
      moduleId?: number
      transactionId?: number
    }) => {
      try {
        const response = await apiProxy.post(`${UserGrid.add}`, data, {
          headers: { moduleId, transactionId },
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["grid-layout-config"] }),
  })
}
// End Grid Layout Hooks

// =========================
// Basic Setting Hooks
// =========================
// 1. Get GST Percentage by ID & Date
export const useGetGstPercentage = (gstId: number, accountDate: string) => {
  return useQuery({
    queryKey: ["gst-percentage", gstId, accountDate],
    ...defaultQueryConfig,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${BasicSetting.getGstPercentage}/${gstId}/${accountDate}`
      )
      return response.data?.data
    },
    enabled: !!gstId && !!accountDate,
  })
}

// 2. Get Exchange Rate by ID & Date
export const useGetExchangeRate = (currencyId: string, accountDate: string) => {
  return useQuery({
    queryKey: ["exchange-rate", currencyId, accountDate],
    ...defaultQueryConfig,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${BasicSetting.getExchangeRate}/${currencyId}/${accountDate}`
      )
      return response.data?.data
    },
    enabled: !!currencyId && !!accountDate,
  })
}

// 3. Get Exchange Rate Local by ID & Date
export const useGetExchangeRateLocal = (
  currencyId: string,
  accountDate: string
) => {
  return useQuery({
    queryKey: ["exchange-rate-local", currencyId, accountDate],
    ...defaultQueryConfig,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${BasicSetting.getExchangeRateLocal}/${currencyId}/${accountDate}`
      )
      return response.data?.data
    },
    enabled: !!currencyId && !!accountDate,
  })
}

// 4. Get Check Period Closed by ID & Date
export const useGetCheckPeriodClosed = (
  moduleId: string,
  accountDate: string
) => {
  return useQuery({
    queryKey: ["check-period-closed", moduleId, accountDate],
    ...defaultQueryConfig,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${BasicSetting.getCheckPeriodClosed}/${moduleId}/${accountDate}`
      )
      return response.data?.data
    },
    enabled: !!moduleId && !!accountDate,
  })
}

// 5. Get Days from Credit Terms
export const useGetDaysfromCreditTerm = (
  creditTermsId: string,
  accountDate: string
) => {
  return useQuery({
    queryKey: ["days-from-credit-terms", creditTermsId, accountDate],
    ...defaultQueryConfig,
    queryFn: async () => {
      const response = await apiProxy.get(
        `${BasicSetting.getDaysfromCreditTerm}/${creditTermsId}/${accountDate}`
      )
      return response.data?.data
    },
    enabled: !!creditTermsId && !!accountDate,
  })
}
// End Basic Setting Hooks
