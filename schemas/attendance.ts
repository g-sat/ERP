import { z } from "zod"

// Schema for attendance form validation
export const attendanceFormSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  isPresent: z.boolean(), // Match C# bool (non-nullable boolean)
})

export type AttendanceFormValue = z.infer<typeof attendanceFormSchema>
