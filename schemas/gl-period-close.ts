import * as z from "zod"

export const glPeriodCloseSchema = z
  .object({
    companyId: z.string().min(1, "Company ID is required"),
    year: z
      .number()
      .min(2020, "Year must be 2020 or later")
      .max(2030, "Year must be 2030 or earlier"),
    month: z
      .number()
      .min(1, "Month must be between 1 and 12")
      .max(12, "Month must be between 1 and 12"),
    startDate: z.string().min(1, "Start date is required"),
    closeDate: z.string().min(1, "Close date is required"),
    arClosed: z.boolean().default(false),
    arVatClosed: z.boolean().default(false),
    apClosed: z.boolean().default(false),
    apVatClosed: z.boolean().default(false),
    cbClosed: z.boolean().default(false),
    glClosed: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const closeDate = new Date(data.closeDate)
      return closeDate >= startDate
    },
    {
      message: "Close date must be after or equal to start date",
      path: ["closeDate"],
    }
  )

export const glPeriodCloseFilterSchema = z.object({
  companyId: z.string().optional(),
  year: z.number().min(2020).max(2030).optional(),
  month: z.number().min(1).max(12).optional(),
  isActive: z.boolean().optional(),
})

export const glPeriodCloseBulkActionSchema = z.object({
  periodIds: z.array(z.string()).min(1, "At least one period must be selected"),
  action: z.enum(["close", "reopen"], {
    required_error: "Action is required",
  }),
  module: z.enum(["AR", "AP", "CB", "GL"], {
    required_error: "Module is required",
  }),
  closeBy: z.string().min(1, "Close by is required"),
})

// Export types
export type GLPeriodCloseFormData = z.infer<typeof glPeriodCloseSchema>
export type GLPeriodCloseFilterFormData = z.infer<
  typeof glPeriodCloseFilterSchema
>
export type GLPeriodCloseBulkActionFormData = z.infer<
  typeof glPeriodCloseBulkActionSchema
>
