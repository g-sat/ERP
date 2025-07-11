import { ICustomerAddress, ICustomerContact } from "@/interfaces/customer"
import {
  IAccountGroupLookup,
  IAccountSetupLookup,
  IAccountTypeLookup,
  IBankLookup,
  IBargeLookup,
  ICarrierTypeLookup,
  IChargeLookup,
  IConsignmentTypeLookup,
  ICountryLookup,
  IDepartmentLookup,
  IDocumentTypeLookup,
  IDynamicLookup,
  IGstCategoryLookup,
  IJobOrderLookup,
  ILandingTypeLookup,
  IModeTypeLookup,
  IModuleLookup,
  IOrderTypeCategoryLookup,
  IOrderTypeLookup,
  IPassTypeLookup,
  IPortLookup,
  IPortRegionLookup,
  IProductLookup,
  IRankLookup,
  IServiceTypeCategoryLookup,
  IServiceTypeLookup,
  IStatusLookup,
  ISubCategoryLookup,
  ISupplierLookup,
  ITaskLookup,
  ITaxCategoryLookup,
  ITaxLookup,
  ITransactionLookup,
  IUomLookup,
  IUserGroupLookup,
  IUserLookup,
  IUserRoleLookup,
  IVesselLookup,
  IVisaTypeLookup,
} from "@/interfaces/lookup"
import { IPaymentType } from "@/interfaces/paymenttype"
import { ISupplierAddress, ISupplierContact } from "@/interfaces/supplier"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"

import {
  Admin,
  DynamicLookupSetting,
  Lookup,
  MandatoryFieldSetting,
  VisibleFieldSetting,
} from "@/lib/api-routes"

/**
 * 1. Base Configuration
 * --------------------
 * 1.1 API Proxy Configuration
 */
const apiProxy = axios.create({
  baseURL: "/api/proxy",
})

/**
 * 1.2 Query Configuration
 */
const defaultQueryConfig = {
  staleTime: 60 * 60 * 1000, // 1 hour
  refetchOnWindowFocus: false,
}

/**
 * 1.3 Error Handler
 */
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>
    throw new Error(axiosError.response?.data?.message || "An error occurred")
  }
  throw error
}

/**
 * 2. Transaction Management
 * ------------------------
 * 2.1 Get Transactions
 * @param {object} params - Parameters object
 * @param {number} params.moduleId - Module ID
 * @returns {object} Query object containing transactions
 */
export const useGetTransactions = ({
  moduleId,
}: {
  moduleId: number | null | undefined
}) => {
  return useQuery({
    queryKey: ["transactions", moduleId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(Admin.getUserTransactions, {
          headers: { moduleId },
        })
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!moduleId,
  })
}

/**
 * 3. Field Management
 * -----------------
 * 3.1 Get Required Fields
 * @param {number} moduleId - Module ID
 * @param {number} transactionId - Transaction ID
 * @returns {object} Query object containing required fields
 */
export const useGetRequiredFields = (
  moduleId: number | undefined,
  transactionId: number | undefined
) => {
  return useQuery({
    queryKey: ["required-fields", moduleId, transactionId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${MandatoryFieldSetting.get}/${moduleId}/${transactionId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!moduleId && !!transactionId,
  })
}

/**
 * 3.2 Get Visible Fields
 * @param {number} moduleId - Module ID
 * @param {number} transactionId - Transaction ID
 * @returns {object} Query object containing visible fields
 */
export const useGetVisibleFields = (
  moduleId: number | undefined,
  transactionId: number | undefined
) => {
  return useQuery({
    queryKey: ["visible-fields", moduleId, transactionId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${VisibleFieldSetting.get}/${moduleId}/${transactionId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!moduleId && !!transactionId,
  })
}

/**
 * 4. Dynamic Lookup Management
 * --------------------------
 * 4.1 Get Dynamic Lookup
 * @returns {object} Query object containing dynamic lookup data
 */
export const useGetDynamicLookup = () => {
  return useQuery<IDynamicLookup>({
    queryKey: ["dynamic-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${DynamicLookupSetting.get}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

/**
 * 5. Contact Management
 * -------------------
 * 5.1 Get Customer Contact Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing customer contacts
 */
export const useCustomerContactLookup = (customerId: number | string) => {
  return useQuery<ICustomerContact[]>({
    queryKey: ["customer-contact-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${Lookup.getCustomerContact}/${customerId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

/**
 * 5.2 Get Customer Address Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing customer addresses
 */
export const useCustomerAddressLookup = (customerId: number | string) => {
  return useQuery<ICustomerAddress[]>({
    queryKey: ["customer-address-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${Lookup.getCustomerAddress}/${customerId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

/**
 * 5.3 Get Supplier Contact Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing supplier contacts
 */
export const useSupplierContactLookup = (customerId: number | string) => {
  return useQuery<ISupplierContact[]>({
    queryKey: ["Supplier-contact-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${Lookup.getSupplierContact}/${customerId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

/**
 * 5.4 Get Supplier Address Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing supplier addresses
 */
export const useSupplierAddressLookup = (customerId: number | string) => {
  return useQuery<ISupplierAddress[]>({
    queryKey: ["Supplier-address-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${Lookup.getSupplierAddress}/${customerId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

export const useModuleLookup = (IsVisible: boolean, IsMandatory: boolean) => {
  return useQuery<IModuleLookup[]>({
    queryKey: ["moduleLookup", IsVisible, IsMandatory],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${Lookup.getModule}/${IsVisible}/${IsMandatory}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCountryLookup = () => {
  return useQuery<ICountryLookup[]>({
    queryKey: ["country-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCountry}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useTaxLookup = () => {
  return useQuery<ITaxLookup[]>({
    queryKey: ["tax-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getTax}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useTaxCategoryLookup = () => {
  return useQuery<ITaxCategoryLookup[]>({
    queryKey: ["taxCategory-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getTaxCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useGstCategoryLookup = () => {
  return useQuery<IGstCategoryLookup[]>({
    queryKey: ["gstCategory-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getGstCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useBankLookup = () => {
  return useQuery<IBankLookup[]>({
    queryKey: ["bank-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getBank}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useDepartmentLookup = () => {
  return useQuery<IDepartmentLookup[]>({
    queryKey: ["department-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getDepartment}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useProductLookup = () => {
  return useQuery<IProductLookup[]>({
    queryKey: ["product-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getProduct}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useBargeLookup = () => {
  return useQuery<IBargeLookup[]>({
    queryKey: ["barge-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getBarge}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useGstLookup = () => {
  return useQuery({
    queryKey: ["gst-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getGst}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useEmployeeLookup = () => {
  return useQuery({
    queryKey: ["employee-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getEmployee}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useAccountGroupLookup = () => {
  return useQuery<IAccountGroupLookup[]>({
    queryKey: ["account-group-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getAccountGroup}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useAccountTypeLookup = () => {
  return useQuery<IAccountTypeLookup[]>({
    queryKey: ["account-type-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getAccountType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useAccountSetupLookup = () => {
  return useQuery<IAccountSetupLookup[]>({
    queryKey: ["account-setup-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getAccountSetup}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCategoryLookup = () => {
  return useQuery({
    queryKey: ["category-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const usePortregionLookup = () => {
  return useQuery({
    queryKey: ["portregion-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getPortRegion}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useVoyageLookup = () => {
  return useQuery({
    queryKey: ["voyage-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getVoyage}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useDesignationLookup = () => {
  return useQuery({
    queryKey: ["designation-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getDesignation}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCOACategory1Lookup = () => {
  return useQuery({
    queryKey: ["coacategory1-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCoaCategory1}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCOACategory2Lookup = () => {
  return useQuery({
    queryKey: ["coacategory2-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCoaCategory2}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCOACategory3Lookup = () => {
  return useQuery({
    queryKey: ["coacategory3-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCoaCategory3}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useAccountSetupCategoryLookup = () => {
  return useQuery({
    queryKey: ["account-setup-category-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getAccountSetupCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCustomerLookup = () => {
  return useQuery({
    queryKey: ["customer-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCustomer}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useSupplierLookup = () => {
  return useQuery<ISupplierLookup[]>({
    queryKey: ["customer-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getSupplier}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const usePortLookup = () => {
  return useQuery<IPortLookup[]>({
    queryKey: ["port-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getPort}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const usePortRegionLookup = () => {
  return useQuery<IPortRegionLookup[]>({
    queryKey: ["port-region-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getPortRegion}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useUserLookup = () => {
  return useQuery<IUserLookup[]>({
    queryKey: ["user-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getUser}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCurrencyLookup = () => {
  return useQuery({
    queryKey: ["currency-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCurrency}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCreditTermLookup = () => {
  return useQuery({
    queryKey: ["creditterm-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCreditTerm}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useChartofAccountLookup = () => {
  return useQuery({
    queryKey: ["chartofaccount-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getChartOfAccount}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useUomLookup = () => {
  return useQuery<IUomLookup[]>({
    queryKey: ["uom-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getUom}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useUserGroupLookup = () => {
  return useQuery<IUserGroupLookup[]>({
    queryKey: ["usergroup-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getUserGroup}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useUserRoleLookup = () => {
  return useQuery<IUserRoleLookup[]>({
    queryKey: ["userrole-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getUserRole}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useOrderTypeLookup = () => {
  return useQuery<IOrderTypeLookup[]>({
    queryKey: ["ordertype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getOrderType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useOrderTypeCategoryLookup = () => {
  return useQuery<IOrderTypeCategoryLookup[]>({
    queryKey: ["ordertypecategory-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getOrderTypeCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useServiceTypeLookup = () => {
  return useQuery<IServiceTypeLookup[]>({
    queryKey: ["servicetype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getServiceType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useServiceTypeCategoryLookup = () => {
  return useQuery<IServiceTypeCategoryLookup[]>({
    queryKey: ["servicetypecategory-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getOrderTypeCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useSubCategoryLookup = () => {
  return useQuery<ISubCategoryLookup[]>({
    queryKey: ["subcategory-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getSubCategory}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useTransactionLookup = (id: number) => {
  return useQuery<ITransactionLookup[]>({
    queryKey: ["transaction-lookUp", id],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getTransaction}/${id}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: id !== 0,
  })
}

export const usePaymentTypeLookup = () => {
  return useQuery<IPaymentType[]>({
    queryKey: ["paymenttype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getPaymentType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useVesselLookup = () => {
  return useQuery<IVesselLookup[]>({
    queryKey: ["vessel-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getVessel}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useJobOrderLookup = () => {
  return useQuery<IJobOrderLookup[]>({
    queryKey: ["joborder-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getJobOrder}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useTaskLookup = () => {
  return useQuery<ITaskLookup[]>({
    queryKey: ["task-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getTask}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useChargeLookup = (taskId: number) => {
  return useQuery<IChargeLookup[]>({
    queryKey: ["charge-lookUp", taskId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCharge}/${taskId}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: taskId !== 0,
  })
}

export const useJobOrderTaskLookup = (jobOrderId: number) => {
  return useQuery<ITaskLookup[]>({
    queryKey: ["joborder-task-lookUp", jobOrderId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getTask}/${jobOrderId}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: jobOrderId !== 0,
  })
}

export const useJobOrderChargeLookup = (jobOrderId: number, taskId: number) => {
  return useQuery<IChargeLookup[]>({
    queryKey: ["joborder-charge-lookUp", jobOrderId, taskId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(
          `${Lookup.getCharge}/${jobOrderId}/${taskId}`
        )
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: jobOrderId !== 0 && taskId !== 0,
  })
}

export const useDocumentTypeLookup = () => {
  return useQuery<IDocumentTypeLookup[]>({
    queryKey: ["documenttype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getDocumentType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useStatusLookup = () => {
  return useQuery<IStatusLookup[]>({
    queryKey: ["status-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getStatus}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useStatusTaskLookup = () => {
  return useQuery<IStatusLookup[]>({
    queryKey: ["statustask-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getStatusTask}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useRankLookup = () => {
  return useQuery<IRankLookup[]>({
    queryKey: ["rank-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getRank}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useVisaTypeLookup = () => {
  return useQuery<IVisaTypeLookup[]>({
    queryKey: ["visatype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getVisaType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const usePassTypeLookup = () => {
  return useQuery<IPassTypeLookup[]>({
    queryKey: ["passtype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getPassType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useLandingTypeLookup = () => {
  return useQuery<ILandingTypeLookup[]>({
    queryKey: ["landingtype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getLandingType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useModeTypeLookup = () => {
  return useQuery<IModeTypeLookup[]>({
    queryKey: ["modetype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getModeType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useConsignmentTypeLookup = () => {
  return useQuery<IConsignmentTypeLookup[]>({
    queryKey: ["consignmenttype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getConsignmentType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useCarrierTypeLookup = () => {
  return useQuery<ICarrierTypeLookup[]>({
    queryKey: ["carriertype-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await apiProxy.get(`${Lookup.getCarrierType}`)
        return response.data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useJobOrderCustomerLookup = (
  customerId: number,
  jobOrderId: number
) => {
  return useQuery<IJobOrderLookup[]>({
    queryKey: ["joborder-customer-lookUp", customerId, jobOrderId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        // If jobOrderId is 0, we want all job orders for the customer
        // For now, we'll use the regular job order lookup and filter by customer
        // This is a temporary solution until we have a proper endpoint
        if (jobOrderId === 0) {
          const response = await apiProxy.get(`${Lookup.getJobOrder}`)
          // Filter by customerId if available
          const allJobOrders = response.data
          return allJobOrders.filter(
            (jobOrder: IJobOrderLookup & { customerId?: number }) =>
              jobOrder.customerId === customerId
          )
        } else {
          const response = await apiProxy.get(
            `${Lookup.getJobOrderCustomer}/${customerId}/${jobOrderId}`
          )

          return response.data?.data || []
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}
