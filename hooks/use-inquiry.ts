import { IArInvoiceHd } from "@/interfaces/ar-invoice"
import { IArOutTransaction } from "@/interfaces/outtransaction"
import { IApOutTransaction } from "@/interfaces/outtransaction"
import { IGlTransactionDetails } from "@/interfaces/history"
import { IJobOrderHd } from "@/interfaces/checklist"

import { Inquiry } from "@/lib/api-routes"

import { useGet, useGetWithDates } from "./use-common"

/**
 * Checklist Inquiry - Cross-company search using Inquiry API routes and use-common
 * @param {string} searchString - Search string filter
 * @param {boolean} enabled - Whether the query is enabled
 * @returns {object} Query object containing checklist/job order data
 */
export function useGetChecklistInquiry(
  searchString?: string,
  enabled: boolean = false
) {
  return useGet<IJobOrderHd>(
    Inquiry.getChecklistInquiry,
    "checklist-inquiry",
    searchString,
    {
      enabled,
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  )
}

/**
 * Customer Invoice Inquiry - Cross-company search using Inquiry API routes and use-common
 * @param {string} searchString - Search string filter
 * @param {string} startDate - Start date filter
 * @param {string} endDate - End date filter
 * @param {boolean} enabled - Whether the query is enabled
 * @returns {object} Query object containing customer invoice data
 */
export function useGetCustomerInvoiceInquiry(
  searchString?: string,
  startDate?: string,
  endDate?: string,
  enabled: boolean = false
) {
  return useGetWithDates<IArInvoiceHd>(
    Inquiry.getCustomerInquiry,
    "customer-invoice-inquiry",
    searchString,
    startDate,
    endDate,
    undefined,
    enabled
  )
}

/**
 * AR Transaction Inquiry - Cross-company search using Inquiry API routes and use-common
 * @param {string} searchString - Search string filter (can include customer/currency filters)
 * @param {number} customerId - Customer ID filter
 * @param {number} currencyId - Currency ID filter
 * @param {string} startDate - Start date filter
 * @param {string} endDate - End date filter
 * @param {boolean} enabled - Whether the query is enabled
 * @returns {object} Query object containing AR transaction data
 */
export function useGetArTransactionInquiry(
  searchString?: string,
  customerId?: number,
  currencyId?: number,
  startDate?: string,
  endDate?: string,
  enabled: boolean = false
) {
  // Build search string with filters
  const filters: string[] = []
  if (customerId && customerId > 0) filters.push(`customerId:${customerId}`)
  if (currencyId && currencyId > 0) filters.push(`currencyId:${currencyId}`)
  if (searchString) filters.push(searchString)
  const combinedSearch = filters.length > 0 ? filters.join("|") : undefined

  return useGetWithDates<IArOutTransaction>(
    Inquiry.getArTransactionInquiry,
    "ar-transaction-inquiry",
    combinedSearch,
    startDate,
    endDate,
    undefined,
    enabled
  )
}

/**
 * AP Transaction Inquiry - Cross-company search using Inquiry API routes and use-common
 * @param {string} searchString - Search string filter (can include supplier/currency filters)
 * @param {number} supplierId - Supplier ID filter (using customerId field for consistency)
 * @param {number} currencyId - Currency ID filter
 * @param {string} startDate - Start date filter
 * @param {string} endDate - End date filter
 * @param {boolean} enabled - Whether the query is enabled
 * @returns {object} Query object containing AP transaction data
 */
export function useGetApTransactionInquiry(
  searchString?: string,
  supplierId?: number,
  currencyId?: number,
  startDate?: string,
  endDate?: string,
  enabled: boolean = false
) {
  // Build search string with filters
  const filters: string[] = []
  if (supplierId && supplierId > 0) filters.push(`supplierId:${supplierId}`)
  if (currencyId && currencyId > 0) filters.push(`currencyId:${currencyId}`)
  if (searchString) filters.push(searchString)
  const combinedSearch = filters.length > 0 ? filters.join("|") : undefined

  return useGetWithDates<IApOutTransaction>(
    Inquiry.getApTransactionInquiry,
    "ap-transaction-inquiry",
    combinedSearch,
    startDate,
    endDate,
    undefined,
    enabled
  )
}

/**
 * GL Transaction Inquiry - Cross-company search using Inquiry API routes and use-common
 * @param {string} searchString - Search string filter
 * @param {number[]} glIds - Array of GL IDs (Chart of Account IDs)
 * @param {string} fromDate - From date filter
 * @param {string} toDate - To date filter
 * @param {boolean} enabled - Whether the query is enabled
 * @returns {object} Query object containing GL transaction data
 */
export function useGetGlTransactionInquiry(
  searchString?: string,
  glIds?: number[],
  fromDate?: string,
  toDate?: string,
  enabled: boolean = false
) {
  // Build search string with GL IDs
  const filters: string[] = []
  if (glIds && glIds.length > 0) {
    filters.push(`glIds:${glIds.join(",")}`)
  }
  if (searchString) filters.push(searchString)
  const combinedSearch = filters.length > 0 ? filters.join("|") : undefined

  return useGetWithDates<IGlTransactionDetails>(
    Inquiry.getGlTransactionInquiry,
    "gl-transaction-inquiry",
    combinedSearch,
    fromDate,
    toDate,
    undefined,
    enabled
  )
}
