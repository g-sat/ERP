/**
 * Formatting Utilities
 *
 * This module provides shared formatting functions for numbers and other data types
 * across all modules in the ERP system.
 */

/**
 * Format number with specified decimal places
 * Includes thousands separators for better readability
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string with thousands separators
 */
export const formatNumber = (
  value: number | string | null | undefined,
  decimals: number
): string => {
  const numValue = Number(value) || 0
  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format number with specified decimal places (simple version)
 * Does NOT include thousands separators - for calculations and internal use
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string without separators
 */
export const formatNumberSimple = (
  value: number | string | null | undefined,
  decimals: number
): string => {
  const numValue = Number(value) || 0
  return numValue.toFixed(decimals)
}
