import * as z from "zod"

export const tariffFiltersSchema = z.object({
  search: z.string().optional(),
  task: z.string().optional(),
  port: z.string().optional(),
  customer: z.string().optional(),
  sortBy: z.enum(["task", "charge", "uom", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type TariffFiltersValues = z.infer<typeof tariffFiltersSchema>

export const tariffSchema = z
  .object({
    tariffId: z.number().default(0),
    taskId: z.number().min(1, "Task is required"),
    chargeId: z.number().min(1, "Charge is required"),
    portId: z.number().min(1, "Port is required"),
    customerId: z.number().min(1, "Customer is required"),
    currencyId: z.number().optional().default(0),
    uomId: z.number().min(1, "Unit of Measure is required"),
    visaTypeId: z.number().optional().default(0),
    displayRate: z.number().min(0, "Display Rate is required"),
    basicRate: z.number().min(0, "Basic Rate is required"),
    minUnit: z.number().min(0, "Min Unit is required"),
    maxUnit: z.number().min(0, "Max Unit is required"),
    isAdditional: z.boolean().default(false),
    additionalUnit: z.number().optional().default(0),
    additionalRate: z.number().optional().default(0),
    prepaymentPercentage: z.number().optional().default(0),
    isPrepayment: z.boolean().default(false),
    seqNo: z.number().optional().default(0),
    isDefault: z.boolean().default(true),
    remarks: z.string().optional().default(""),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If isAdditional is true, additionalUnit and additionalRate are required
      if (data.isAdditional) {
        return data.additionalUnit > 0 && data.additionalRate > 0
      }
      return true
    },
    {
      message:
        "Additional Unit and Additional Rate are required when Additional is enabled",
      path: ["additionalUnit", "additionalRate"],
    }
  )
  .refine(
    (data) => {
      // If isPrepayment is true, prepaymentPercentage is required
      if (data.isPrepayment) {
        return data.prepaymentPercentage > 0
      }
      return true
    },
    {
      message: "Prepayment Rate is required when Prepayment is enabled",
      path: ["prepaymentPercentage"],
    }
  )

export type TariffFormValues = z.infer<typeof tariffSchema>
