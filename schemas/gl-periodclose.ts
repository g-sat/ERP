import * as z from "zod"

// Schema for generate period form
export const generatePeriodSchema = z.object({
  yearId: z.number().min(2020, "Year must be 2020 or later"),
  monthId: z.number().min(1, "Month must be between 1-12").max(12),
  totalPeriod: z
    .number()
    .min(1, "Total period must be at least 1")
    .max(12, "Total period cannot exceed 12"),
})

export type GeneratePeriodFormValues = z.infer<typeof generatePeriodSchema>
