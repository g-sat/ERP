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
export const clientDateFormat = "yyyy-MM-dd"

export const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date // Validate date
  } catch (e) {
    console.error("Error parsing date:", dateStr, e)
    return null
  }
}
