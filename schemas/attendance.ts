import { z } from "zod"

// Schema for attendance form validation
export const attendanceFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  companyId: z.number().min(1, "Company is required"),
  date: z.string().min(1, "Date is required"),
  status: z.string().min(1, "Status is required"),
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  totalWorkingHours: z.string().optional(),
  earlyOutHours: z.string().optional(),
  remarks: z.string().optional(),
})

export type AttendanceFormValue = z.infer<typeof attendanceFormSchema>
