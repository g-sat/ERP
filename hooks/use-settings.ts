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
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { getData, saveData } from "@/lib/api-client"
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

// Common query configuration

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
      return await getData(DecimalSetting.get)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Decimal Setting
export const useDecimalSave = () => {
  return useMutation({
    mutationFn: async (data: IDecFormat) => {
      try {
        return await saveData(DecimalSetting.add, data)
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
      return await getData(FinanceSetting.get)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Finance Setting
export const useFinanceSave = () => {
  return useMutation({
    mutationFn: async (data: IFinance) => {
      try {
        return await saveData(FinanceSetting.add, data)
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
      return await getData(UserSetting.get)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save User Setting
export const useUserSettingSave = () => {
  return useMutation({
    mutationFn: async (data: IUserSetting) => {
      try {
        return await saveData(UserSetting.add, data)
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
      return await getData(`${MandatoryFieldSetting.getV1}/${moduleId}`)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Mandatory Field Settings
export const useMandatoryFieldSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: IMandatoryFields[] }) => {
      try {
        return await saveData(MandatoryFieldSetting.add, data)
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
      return await getData(`${VisibleFieldSetting.getV1}/${moduleId}`)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Visible Field Settings
export const useVisibleFieldSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: IVisibleFields[] }) => {
      try {
        return await saveData(VisibleFieldSetting.add, data)
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
      return await getData(DynamicLookupSetting.get)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Dynamic Lookup Settings
export const useDynamicLookupSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: IDynmaicLookup[] }) => {
      try {
        return await saveData(DynamicLookupSetting.add, data)
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
// 1. Get Grid Settings
export const useGridSettingGet = (moduleId: number, transactionId: number) => {
  return useQuery({
    queryKey: ["gridsetting", moduleId, transactionId],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      return await getData(`${UserGrid.get}/${moduleId}/${transactionId}`)
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Save Grid Settings
export const useGridSettingSave = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: IGridSetting[] }) => {
      try {
        return await saveData(UserGrid.add, data)
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
    queryKey: ["usergridsetting", userId],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      return await getData(`${UserGrid.getById}/${userId}`)
    },
    refetchOnWindowFocus: false,
    ...options,
  })
}

// 2. Clone User Grid Settings
export const useCloneUserSettingSave = () => {
  return useMutation({
    mutationFn: async (data: ICloneUserGridSetting) => {
      try {
        return await saveData(
          `${UserGrid.clone}/${data.fromUserId}/${data.toUserId}`,
          data
        )
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error cloning user grid settings:", error)
          throw error.response?.data || "Error cloning user grid settings."
        }
        throw error
      }
    },
  })
}
// End User Grid Setting Hooks

// =========================
// Module Transaction List Hooks
// =========================
// 1. Get Module Transaction List
export const useModuleTransactionListGet = () => {
  return useQuery({
    queryKey: ["moduletransactionlist"],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      return await getData(NumberFormat.getmodtrnslist)
    },
    refetchOnWindowFocus: false,
  })
}
// End Module Transaction List Hooks

// =========================
// Number Format Hooks
// =========================
// 1. Get Number Format Data by ID
export const useNumberFormatDataById = ({
  moduleId,
  transactionId,
}: {
  moduleId: number
  transactionId: number
}) => {
  return useQuery({
    queryKey: ["numberformat", moduleId, transactionId],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      return await getData(
        `${NumberFormat.getById}/${moduleId}/${transactionId}`
      )
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Get Number Format Details Data
export const useNumberFormatDetailsDataGet = ({
  id,
  year,
}: {
  id: number
  year: number
}) => {
  return useQuery({
    queryKey: ["numberformatdetails", id, year],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      return await getData(`${NumberFormat.getByYear}/${id}/${year}`)
    },
    refetchOnWindowFocus: false,
  })
}

// 3. Save Number Format
export const useNumberFormatSave = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      try {
        return await saveData(NumberFormat.add, data)
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error saving number format:", error)
          throw error.response?.data || "Error saving number format."
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
// 1. Get Grid Layout
export const useGetGridLayout = (
  moduleId: string,
  transactionId: string,
  gridName: string
) => {
  // Debug logging for useGetGridLayout
  console.log("🔍 useGetGridLayout Debug:", {
    moduleId,
    transactionId,
    gridName,
    moduleIdType: typeof moduleId,
    transactionIdType: typeof transactionId,
  })

  return useQuery({
    queryKey: ["gridlayout", moduleId, transactionId, gridName],
    placeholderData: keepPreviousData,
    staleTime: 600000,
    queryFn: async () => {
      return await getData(`${UserGrid.getV1}/${gridName}`, {
        moduleId,
        transactionId,
      })
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Update Grid Layout
export const useUpdateGridLayout = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      try {
        return await saveData(`${UserGrid.add}`, data)
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error("Error updating grid layout:", error)
          throw error.response?.data || "Error updating grid layout."
        }
        throw error
      }
    },
  })
}
// End Grid Layout Hooks

// =========================
// Utility Hooks
// =========================
// 1. Get GST Percentage
export const useGetGstPercentage = (gstId: number, accountDate: string) => {
  return useQuery({
    queryKey: ["gstpercentage", gstId, accountDate],
    queryFn: async () => {
      return await getData(
        `${BasicSetting.getGstPercentage}/${gstId}/${accountDate}`
      )
    },
    refetchOnWindowFocus: false,
  })
}

// 2. Get Exchange Rate
export const useGetExchangeRate = (currencyId: string, accountDate: string) => {
  return useQuery({
    queryKey: ["exchangerate", currencyId, accountDate],
    queryFn: async () => {
      return await getData(
        `/setting/GetExchangeRate/${currencyId}/${accountDate}`
      )
    },
    refetchOnWindowFocus: false,
  })
}

// 3. Get Exchange Rate Local
export const useGetExchangeRateLocal = (
  currencyId: string,
  accountDate: string
) => {
  return useQuery({
    queryKey: ["exchangeratelocal", currencyId, accountDate],
    queryFn: async () => {
      return await getData(
        `/setting/GetExchangeRateLocal/${currencyId}/${accountDate}`
      )
    },
    refetchOnWindowFocus: false,
  })
}

// 4. Get Check Period Closed
export const useGetCheckPeriodClosed = (
  moduleId: string,
  accountDate: string
) => {
  return useQuery({
    queryKey: ["checkperiodclosed", moduleId, accountDate],
    queryFn: async () => {
      return await getData(
        `/setting/GetCheckPeriodClosed/${moduleId}/${accountDate}`
      )
    },
    refetchOnWindowFocus: false,
  })
}

// 5. Get Days from Credit Term
export const useGetDaysfromCreditTerm = (
  creditTermsId: string,
  accountDate: string
) => {
  return useQuery({
    queryKey: ["daysfromcreditterm", creditTermsId, accountDate],
    queryFn: async () => {
      return await getData(
        `/setting/GetDaysfromCreditTerm/${creditTermsId}/${accountDate}`
      )
    },
    refetchOnWindowFocus: false,
  })
}
// End Utility Hooks
