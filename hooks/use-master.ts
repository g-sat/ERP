import { ApiResponse } from "@/interfaces/auth"
import { useQuery } from "@tanstack/react-query"

import { getById, getData } from "@/lib/api-client"

/**
 * 1. Customer Management
 * ---------------------
 * 1.1 Get Customer by ID (Version 1)
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {number} customerId - Customer ID
 * @param {string} customerCode - Optional customer code
 * @param {string} customerName - Optional customer name
 * @returns {object} Query object containing customer data
 */
export function useGetCustomerByIdV1<T>(
  baseUrl: string,
  queryKey: string,
  customerId: number,
  customerCode?: string,
  customerName?: string
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, customerId, customerCode, customerName],
    queryFn: async () => {
      // Clean and construct base URL
      const cleanUrl = baseUrl.replace(/\/+/g, "/")

      // Add optional query parameters
      const params: Record<string, string> = {}
      if (customerId) params.customerId = customerId.toString()
      if (customerCode) params.customerCode = customerCode
      if (customerName) params.customerName = customerName

      return await getData(cleanUrl, params)
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    enabled: !!customerId, // Only run query when customerId exists
  })
}

/**
 * 1.2 Get Customer by ID
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {number} customerId - Customer ID
 * @param {string} customerCode - Customer code (default: "0")
 * @param {string} customerName - Customer name (default: "0")
 * @returns {object} Query object containing customer data
 */
export function useGetCustomerById<T>(
  baseUrl: string,
  queryKey: string,
  customerId: number,
  customerCode: string = "0",
  customerName: string = "0"
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, customerId, customerCode, customerName],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getById(
        `${cleanUrl}/${customerId}/${customerCode}/${customerName}`
      )
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!(
      customerId ||
      (customerCode && customerCode !== "0") ||
      (customerName && customerName !== "0")
    ),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * 2. Supplier Management
 * --------------------
 * 2.1 Get Supplier by ID
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {number} supplierId - Supplier ID
 * @param {string} supplierCode - Supplier code (default: "0")
 * @param {string} supplierName - Supplier name (default: "0")
 * @returns {object} Query object containing supplier data
 */
export function useGetSupplierById<T>(
  baseUrl: string,
  queryKey: string,
  supplierId: number,
  supplierCode: string = "0",
  supplierName: string = "0"
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, supplierId, supplierCode, supplierName],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getById(
        `${cleanUrl}/${supplierId}/${supplierCode}/${supplierName}`
      )
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!(
      supplierId ||
      (supplierCode && supplierCode !== "0") ||
      (supplierName && supplierName !== "0")
    ),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

/**
 * 3. Bank Management
 * ----------------
 * 3.1 Get Bank by ID
 * @param {string} baseUrl - Base URL for the API endpoint
 * @param {string} queryKey - Key for caching the query
 * @param {number} bankId - Bank ID
 * @param {string} bankCode - Bank code (default: "0")
 * @param {string} bankName - Bank name (default: "0")
 * @returns {object} Query object containing bank data
 */
export function useGetBankById<T>(
  baseUrl: string,
  queryKey: string,
  bankId: number,
  bankCode: string = "0",
  bankName: string = "0"
) {
  return useQuery<ApiResponse<T>>({
    queryKey: [queryKey, bankId, bankCode, bankName],
    queryFn: async () => {
      const cleanUrl = baseUrl.replace(/\/+/g, "/")
      return await getById(`${cleanUrl}/${bankId}/${bankCode}/${bankName}`)
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: !!(
      bankId ||
      (bankCode && bankCode !== "0") ||
      (bankName && bankName !== "0")
    ),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}
