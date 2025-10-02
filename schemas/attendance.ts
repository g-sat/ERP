import { z } from "zod"

// Schema for attendance form validation
export const attendanceFormSchema = z.object({
  employeeId: z.number().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["P", "A", "WK", "VL"]), // Attendance status
  isPresent: z.boolean().optional(), // Optional for backward compatibility
})

export type AttendanceFormValue = z.infer<typeof attendanceFormSchema>
