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
    tariffId: z.number(),
    taskId: z.number().min(1, "Task is required"),
    chargeId: z.number().min(1, "Charge is required"),
    portId: z.number().min(1, "Port is required"),
    customerId: z.number().min(1, "Customer is required"),
    currencyId: z.number().optional(),
    uomId: z.number().min(1, "Unit of Measure is required"),
    visaId: z.number().optional(),
    displayRate: z.number().min(0, "Display Rate is required"),
    basicRate: z.number().min(0, "Basic Rate is required"),
    minUnit: z.number().min(0, "Min Unit is required"),
    maxUnit: z.number().min(0, "Max Unit is required"),
    isAdditional: z.boolean(),
    additionalUnit: z.number().optional(),
    additionalRate: z.number().optional(),
    prepaymentPercentage: z.number().optional(),
    isPrepayment: z.boolean(),
    seqNo: z.number().optional(),
    isDefault: z.boolean(),
    remarks: z.string().optional(),
    isActive: z.boolean(),
    editVersion: z.number().optional(),
  })
  .refine(
    (data) => {
      // If isAdditional is true, additionalUnit and additionalRate are required
      if (data.isAdditional) {
        return (
          data.additionalUnit &&
          data.additionalRate &&
          data.additionalUnit > 0 &&
          data.additionalRate > 0
        )
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
        return data.prepaymentPercentage && data.prepaymentPercentage > 0
      }
      return true
    },
    {
      message: "Prepayment Rate is required when Prepayment is enabled",
      path: ["prepaymentPercentage"],
    }
  )

export type TariffSchemaType = z.infer<typeof tariffSchema>
