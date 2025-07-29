import { ICustomerAddress, ICustomerContact } from "@/interfaces/customer"
import {
  IAccountGroupLookup,
  IAccountSetupCategoryLookup,
  IAccountSetupLookup,
  IAccountTypeLookup,
  IBankLookup,
  IBargeLookup,
  ICOACategory1Lookup,
  ICOACategory2Lookup,
  ICOACategory3Lookup,
  ICarrierTypeLookup,
  ICategoryLookup,
  IChargeLookup,
  IChartofAccountLookup,
  ICompanyLookup,
  IConsignmentTypeLookup,
  ICountryLookup,
  ICreditTermLookup,
  ICurrencyLookup,
  ICustomerLookup,
  IDepartmentLookup,
  IDesignationLookup,
  IDocumentTypeLookup,
  IDynamicLookup,
  IEmpCategoryLookup,
  IEmployeeLookup,
  IGenderLookup,
  IGstCategoryLookup,
  IGstLookup,
  IJobOrderLookup,
  ILandingTypeLookup,
  ILeaveTypeLookup,
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
  IVoyageLookup,
} from "@/interfaces/lookup"
import { IPaymentType } from "@/interfaces/paymenttype"
import { ISupplierAddress, ISupplierContact } from "@/interfaces/supplier"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { apiClient, getData } from "@/lib/api-client"
import {
  Admin,
  DynamicLookupSetting,
  Lookup,
  MandatoryFieldSetting,
  VisibleFieldSetting,
} from "@/lib/api-routes"

/**
 * 1. Query Configuration
 */
const defaultQueryConfig = {
  staleTime: 60 * 60 * 1000, // 1 hour
  refetchOnWindowFocus: false,
}

/**
 * 2. Error Handler
 */
const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<{ message: string }>
    throw new Error(axiosError.response?.data?.message || "An error occurred")
  }
  throw error
}

/**
 * 3. Transaction Management
 * ------------------------
 * 3.1 Get Transactions
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
        const response = await apiClient.get(Admin.getUserTransactions, {
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
 * 4. Field Management
 * -----------------
 * 4.1 Get Required Fields
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
        const data = await getData(
          `${MandatoryFieldSetting.get}/${moduleId}/${transactionId}`
        )
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!moduleId && !!transactionId,
  })
}

/**
 * 4.2 Get Visible Fields
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
        const data = await getData(
          `${VisibleFieldSetting.get}/${moduleId}/${transactionId}`
        )
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!moduleId && !!transactionId,
  })
}

/**
 * 5. Dynamic Lookup Management
 * --------------------------
 * 5.1 Get Dynamic Lookup
 * @returns {object} Query object containing dynamic lookup data
 */
export const useGetDynamicLookup = () => {
  return useQuery<IDynamicLookup>({
    queryKey: ["dynamic-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(DynamicLookupSetting.get)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

/**
 * 6. Contact Management
 * -------------------
 * 6.1 Get Customer Contact Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing customer contacts
 */
export const useCustomerContactLookup = (customerId: number | string) => {
  return useQuery<ICustomerContact[]>({
    queryKey: ["customer-contact-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(`${Lookup.getCustomerContact}/${customerId}`)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

/**
 * 6.2 Get Customer Address Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing customer addresses
 */
export const useCustomerAddressLookup = (customerId: number | string) => {
  return useQuery<ICustomerAddress[]>({
    queryKey: ["customer-address-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(`${Lookup.getCustomerAddress}/${customerId}`)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

/**
 * 6.3 Get Supplier Contact Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing supplier contacts
 */
export const useSupplierContactLookup = (customerId: number | string) => {
  return useQuery<ISupplierContact[]>({
    queryKey: ["Supplier-contact-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(`${Lookup.getSupplierContact}/${customerId}`)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}

/**
 * 6.4 Get Supplier Address Lookup
 * @param {number|string} customerId - Customer ID
 * @returns {object} Query object containing supplier addresses
 */
export const useSupplierAddressLookup = (customerId: number | string) => {
  return useQuery<ISupplierAddress[]>({
    queryKey: ["Supplier-address-lookup", customerId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(`${Lookup.getSupplierAddress}/${customerId}`)
        return data?.data || []
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
        const data = await getData(
          `${Lookup.getModule}/${IsVisible}/${IsMandatory}`
        )
        return data?.data || []
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
        const data = await getData(Lookup.getCountry)
        return data?.data || []
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
        const data = await getData(Lookup.getTax)
        return data?.data || []
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
        const data = await getData(Lookup.getTaxCategory)
        return data?.data || []
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
        const data = await getData(Lookup.getGstCategory)
        return data?.data || []
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
        const data = await getData(Lookup.getBank)
        return data?.data || []
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
        const data = await getData(Lookup.getDepartment)
        return data?.data || []
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
        const data = await getData(Lookup.getProduct)
        return data?.data || []
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
        const data = await getData(Lookup.getBarge)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useGstLookup = () => {
  return useQuery<IGstLookup[]>({
    queryKey: ["gst-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getGst)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useEmployeeLookup = () => {
  return useQuery<IEmployeeLookup[]>({
    queryKey: ["employee-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getEmployee)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useLeaveTypeLookup = () => {
  return useQuery<ILeaveTypeLookup[]>({
    queryKey: ["leave-type-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getLeaveType)
        return data?.data || []
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
        const data = await getData(Lookup.getAccountGroup)
        return data?.data || []
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
        const data = await getData(Lookup.getAccountType)
        return data?.data || []
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
        const data = await getData(Lookup.getAccountSetup)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCategoryLookup = () => {
  return useQuery<ICategoryLookup[]>({
    queryKey: ["category-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCategory)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const usePortregionLookup = () => {
  return useQuery<IPortRegionLookup[]>({
    queryKey: ["portregion-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getPortRegion)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useVoyageLookup = () => {
  return useQuery<IVoyageLookup[]>({
    queryKey: ["voyage-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getVoyage)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useDesignationLookup = () => {
  return useQuery<IDesignationLookup[]>({
    queryKey: ["designation-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getDesignation)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCOACategory1Lookup = () => {
  return useQuery<ICOACategory1Lookup[]>({
    queryKey: ["coacategory1-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCoaCategory1)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCOACategory2Lookup = () => {
  return useQuery<ICOACategory2Lookup[]>({
    queryKey: ["coacategory2-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCoaCategory2)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCOACategory3Lookup = () => {
  return useQuery<ICOACategory3Lookup[]>({
    queryKey: ["coacategory3-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCoaCategory3)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useAccountSetupCategoryLookup = () => {
  return useQuery<IAccountSetupCategoryLookup[]>({
    queryKey: ["account-setup-category-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getAccountSetupCategory)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useSupplierLookup = () => {
  return useQuery<ISupplierLookup[]>({
    queryKey: ["supplier-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getSupplier)
        return data?.data || []
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
        const data = await getData(Lookup.getPort)
        return data?.data || []
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
        const data = await getData(Lookup.getPortRegion)
        return data?.data || []
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
        const data = await getData(Lookup.getUser)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCurrencyLookup = () => {
  return useQuery<ICurrencyLookup[]>({
    queryKey: ["currency-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCurrency)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useCreditTermLookup = () => {
  return useQuery<ICreditTermLookup[]>({
    queryKey: ["creditterm-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCreditTerm)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
  })
}

export const useChartofAccountLookup = () => {
  return useQuery<IChartofAccountLookup[]>({
    queryKey: ["chartofaccount-lookup"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getChartOfAccount)
        return data?.data || []
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
        const data = await getData(Lookup.getUom)
        return data?.data || []
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
        const data = await getData(Lookup.getUserGroup)
        return data?.data || []
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
        const data = await getData(Lookup.getUserRole)
        return data?.data || []
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
        const data = await getData(Lookup.getOrderType)
        return data?.data || []
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
        const data = await getData(Lookup.getOrderTypeCategory)
        return data?.data || []
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
        const data = await getData(Lookup.getServiceType)
        return data?.data || []
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
        const data = await getData(Lookup.getOrderTypeCategory)
        return data?.data || []
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
        const data = await getData(Lookup.getSubCategory)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useEmpCategoryLookup = () => {
  return useQuery<IEmpCategoryLookup[]>({
    queryKey: ["empcategory-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getEmpCategory)
        return data?.data || []
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
        const data = await getData(`${Lookup.getTransaction}/${id}`)
        return data?.data || []
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
        const data = await getData(Lookup.getPaymentType)
        return data?.data || []
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
        const data = await getData(Lookup.getVessel)
        console.log("Vessel lookup response:", data?.data)
        return data?.data || []
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
        const data = await getData(Lookup.getJobOrder)
        return data?.data || []
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
        const data = await getData(Lookup.getTask)
        return data?.data || []
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
        const data = await getData(`${Lookup.getCharge}/${taskId}`)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: taskId !== 0,
  })
}

export const useCustomerLookup = () => {
  return useQuery<ICustomerLookup[]>({
    queryKey: ["customer-lookUp"],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        // Using the new api-client approach
        const data = await getData(Lookup.getCustomer)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: true,
  })
}

export const useCompanyCustomerLookup = (companyId: number) => {
  return useQuery<ICustomerLookup[]>({
    queryKey: ["customer-lookUp", companyId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        // Using the new api-client approach
        const data = await getData(`${Lookup.getCompanyCustomer}/${companyId}`)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: companyId !== 0,
  })
}

export const useJobOrderTaskLookup = (jobOrderId: number) => {
  return useQuery<ITaskLookup[]>({
    queryKey: ["joborder-task-lookUp", jobOrderId],
    ...defaultQueryConfig,
    queryFn: async () => {
      try {
        const data = await getData(`${Lookup.getTask}/${jobOrderId}`)
        return data?.data || []
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
        const data = await getData(
          `${Lookup.getCharge}/${jobOrderId}/${taskId}`
        )
        return data?.data || []
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
        const data = await getData(Lookup.getDocumentType)
        return data?.data || []
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
        const data = await getData(Lookup.getStatus)
        return data?.data || []
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
        const data = await getData(Lookup.getStatusTask)
        return data?.data || []
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
        const data = await getData(Lookup.getRank)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useGenderLookup = () => {
  return useQuery<IGenderLookup[]>({
    queryKey: ["gender-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getGender)
        return data?.data || []
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
        const data = await getData(Lookup.getVisaType)
        return data?.data || []
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
        const data = await getData(Lookup.getPassType)
        return data?.data || []
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
        const data = await getData(Lookup.getLandingType)
        return data?.data || []
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
        const data = await getData(Lookup.getModeType)
        return data?.data || []
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
        const data = await getData(Lookup.getConsignmentType)
        return data?.data || []
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
        const data = await getData(Lookup.getCarrierType)
        return data?.data || []
      } catch (error) {
        handleApiError(error)
      }
    },
    refetchOnWindowFocus: false,
  })
}

export const useCompanyLookup = () => {
  return useQuery<ICompanyLookup[]>({
    queryKey: ["company-lookUp"],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const data = await getData(Lookup.getCompany)
        return data?.data || []
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
          const data = await getData(Lookup.getJobOrder)
          // Filter by customerId if available
          const allJobOrders = data
          return allJobOrders.filter(
            (jobOrder: IJobOrderLookup & { customerId?: number }) =>
              jobOrder.customerId === customerId
          )
        } else {
          const data = await getData(
            `${Lookup.getJobOrderCustomer}/${customerId}/${jobOrderId}`
          )
          return data?.data || []
        }
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: customerId !== 0,
  })
}
