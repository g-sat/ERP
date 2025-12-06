import * as z from "zod"

export const chargeGLMappingSchema = z.object({
  chargeId: z.number(),
  glId: z.number().min(1, { message: "gl account is required" }),
  isActive: z.boolean(),
})

export type ChargeGLMappingSchemaType = z.infer<typeof chargeGLMappingSchema>

export const chargeGLMappingFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type ChargeGLMappingFiltersValues = z.infer<
  typeof chargeGLMappingFiltersSchema
>
