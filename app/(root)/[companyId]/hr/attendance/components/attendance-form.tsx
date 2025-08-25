"use client"

import { useEffect } from "react"
import { IAttendance } from "@/interfaces/attendance"
import { ICompanyLookup, IEmployeeLookup } from "@/interfaces/lookup"
import { AttendanceFormValue, attendanceFormSchema } from "@/schemas/attendance"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import EmployeeAutocomplete from "@/components/ui-custom/autocomplete-employee"

interface AttendanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: IAttendance
  onSave: (data: AttendanceFormValue) => void
}

export function AttendanceForm({
  open,
  onOpenChange,
  initialData,
  onSave,
}: AttendanceFormProps) {
  const form = useForm<AttendanceFormValue>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      employeeId: "",
      companyId: 0,
      date: "",
      status: "",
      clockIn: "",
      clockOut: "",
      totalWorkingHours: "",
      earlyOutHours: "",
      remarks: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData)
      } else {
        form.reset({
          employeeId: "",
          companyId: 0,
          date: new Date().toISOString().split("T")[0],
          status: "",
          clockIn: "",
          clockOut: "",
          totalWorkingHours: "",
          earlyOutHours: "",
          remarks: "",
        })
      }
    }
  }, [open, initialData, form])

  const handleSubmit = (data: AttendanceFormValue) => {
    onSave(data)
  }

  const handleEmployeeChange = (employee: IEmployeeLookup | null) => {
    form.setValue("employeeId", employee ? employee.employeeId.toString() : "")
  }

  const handleCompanyChange = (company: ICompanyLookup | null) => {
    form.setValue("companyId", company ? company.companyId : 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto sm:w-[80vw] lg:w-[60vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {initialData ? "Edit Attendance Record" : "Add Attendance Record"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {initialData
              ? "Update employee attendance information"
              : "Create a new attendance record for an employee"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeId"
                render={() => (
                  <FormItem>
                    <FormLabel>Employee *</FormLabel>
                    <FormControl>
                      <EmployeeAutocomplete
                        form={form}
                        name="employeeId"
                        label=""
                        isRequired
                        onChangeEvent={handleEmployeeChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyId"
                render={() => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <CompanyAutocomplete
                        form={form}
                        name="companyId"
                        label=""
                        isRequired
                        onChangeEvent={handleCompanyChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="P">Present</SelectItem>
                        <SelectItem value="A">Absent</SelectItem>
                        <SelectItem value="L">Late</SelectItem>
                        <SelectItem value="HL">Half Day</SelectItem>
                        <SelectItem value="CL">Casual Leave</SelectItem>
                        <SelectItem value="PL">Paid Leave</SelectItem>
                        <SelectItem value="WK">Weekend</SelectItem>
                        <SelectItem value="RE">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="clockIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clock In Time</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clockOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clock Out Time</FormLabel>
                    <FormControl>
                      <Input type="time" placeholder="HH:MM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="totalWorkingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Working Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="8.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earlyOutHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Early Out Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional remarks..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {initialData ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
