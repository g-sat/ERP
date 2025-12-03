import * as z from "zod"

export const rankSchema = z.object({
  rankId: z.number(),
  rankCode: z
    .string()
    .min(1, { message: "rank code is required" })
    .max(50, { message: "rank code cannot exceed 50 characters" }),
  rankName: z
    .string()
    .min(2, { message: "rank name must be at least 2 characters" })
    .max(150, { message: "rank name cannot exceed 150 characters" }),

  seqNo: z.number().min(0, { message: "rank order is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type RankSchemaType = z.infer<typeof rankSchema>

export const rankFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type RankFiltersValues = z.infer<typeof rankFiltersSchema>
