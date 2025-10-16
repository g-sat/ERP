import { parse } from "date-fns"

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return ""

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date))
  } catch {
    return ""
  }
}

export const clientDateTimeFormat = "yyyy-MMM-dd HH:mm:ss.SSS"
//export const clientDateFormat = "yyyy-MM-dd"
export const clientDateFormat = "dd/MM/yyyy"

export const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null
  try {
    // First, try parsing with the client date format (dd/MM/yyyy)
    const date = parse(dateStr, clientDateFormat, new Date())
    return isNaN(date.getTime()) ? null : date
  } catch (e) {
    console.error("Error parsing date:", dateStr, e)
    return null
  }
}

export const formatDateWithoutTimezone = (
  date: Date | string | null | undefined
): string | undefined => {
  if (!date) return undefined
  try {
    let dateObj: Date

    if (typeof date === "string") {
      // If it's already a properly formatted ISO string, return it
      if (date.includes("T") && (date.endsWith("Z") || date.includes("+"))) {
        return date
      }
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    // Validate that we have a proper Date object
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.warn("Invalid date object:", date)
      return undefined
    }

    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
    const seconds = String(dateObj.getSeconds()).padStart(2, "0")
    const milliseconds = String(dateObj.getMilliseconds()).padStart(3, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`
  } catch (e) {
    console.error("Error formatting date:", date, e)
    return undefined
  }
}
