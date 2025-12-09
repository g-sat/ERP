import * as z from "zod"

export const bargeGLMappingSchema = z.object({
  bargeId: z.number(),
  glId: z.number().min(1, { message: "gl account is required" }),
  isActive: z.boolean(),
})

export type BargeGLMappingSchemaType = z.infer<typeof bargeGLMappingSchema>

export const bargeGLMappingFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type BargeGLMappingFiltersValues = z.infer<
  typeof bargeGLMappingFiltersSchema
>
