"use client"

import { useEffect, useState } from "react"
import { ILeaveTypeLookup } from "@/interfaces/lookup"
import { LeaveRequestFormValues, leaveRequestSchema } from "@/schemas/leave"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useLeaveTypeLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import LeaveTypeAutocomplete from "@/components/autocomplete/autocomplete-leavetype"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomTextarea from "@/components/custom/custom-textarea"

interface LeaveRequestFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit: (data: LeaveRequestFormValues) => Promise<void>
  employeeId?: string
}

export function LeaveRequestForm({
  open: externalOpen,
  onOpenChange,
  onSubmit,
  employeeId,
}: LeaveRequestFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [loading, setLoading] = useState(false)
  const [selectedLeaveTypeDefaultDays, setSelectedLeaveTypeDefaultDays] =
    useState<number>(0)
  const [selectedLeaveTypeMaxDays, setSelectedLeaveTypeMaxDays] = useState<
    number | null
  >(null)

  // Get leave types for initial default days
  const { data: leaveTypes = [] } = useLeaveTypeLookup()

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveRequestId: 0, // Will be auto-generated on server
      employeeId: employeeId ? parseInt(employeeId) : 33, // Use passed employeeId or default to 33
      leaveTypeId: 1,
      startDate: "",
      endDate: "",
      totalDays: 0,
      reason: "",
      statusId: 1, // Default to pending status
      attachments: "",
    },
  })

  // Listen for custom event to open the form (only if not controlled externally)
  useEffect(() => {
    if (externalOpen === undefined) {
      const handleOpenForm = () => {
        setInternalOpen(true)
      }

      window.addEventListener("openLeaveRequestForm", handleOpenForm)
      return () => {
        window.removeEventListener("openLeaveRequestForm", handleOpenForm)
      }
    }
  }, [externalOpen])

  // Set initial default days when leave types are loaded
  useEffect(() => {
    if (leaveTypes.length > 0) {
      const defaultLeaveType = leaveTypes.find((lt) => lt.leaveTypeId === 1)
      if (defaultLeaveType && defaultLeaveType.defaultDays > 0) {
        setSelectedLeaveTypeDefaultDays(defaultLeaveType.defaultDays)
        form.setValue("totalDays", defaultLeaveType.defaultDays)
      }
      if (
        defaultLeaveType &&
        defaultLeaveType.maxDays !== undefined &&
        defaultLeaveType.maxDays > 0
      ) {
        setSelectedLeaveTypeMaxDays(defaultLeaveType.maxDays)
      }
    }
  }, [leaveTypes, form])

  // Update employeeId when prop changes
  useEffect(() => {
    if (employeeId) {
      form.setValue("employeeId", parseInt(employeeId))
    }
  }, [employeeId, form])

  // Watch for date changes and update totalDays
  useEffect(() => {
    const startDate = form.watch("startDate")
    const endDate = form.watch("endDate")

    if (startDate && endDate) {
      const calculatedDays = calculateDays()
      form.setValue("totalDays", calculatedDays)
    } else {
      form.setValue("totalDays", 0)
    }
  }, [form.watch("startDate"), form.watch("endDate"), form])

  const handleSubmit = async (data: LeaveRequestFormValues) => {
    try {
      setLoading(true)

      // Ensure totalDays is calculated and included
      const calculatedDays = calculateDays()

      // Convert form data to the expected format for submission
      const formData: LeaveRequestFormValues = {
        ...data,
        totalDays: calculatedDays,
        attachments: "",
      }

      await onSubmit(formData)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to submit leave request:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    form.reset()
    setSelectedLeaveTypeDefaultDays(0)
    setSelectedLeaveTypeMaxDays(null)
  }

  const handleCancel = () => {
    setOpen(false)
    resetForm()
  }

  const calculateDays = () => {
    const startDate = form.watch("startDate")
    const endDate = form.watch("endDate")

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleLeaveTypeChange = (selectedOption: ILeaveTypeLookup | null) => {
    if (selectedOption) {
      form.setValue("leaveTypeId", selectedOption.leaveTypeId)

      // Set default days if available
      if (selectedOption.defaultDays && selectedOption.defaultDays > 0) {
        setSelectedLeaveTypeDefaultDays(selectedOption.defaultDays)
        form.setValue("totalDays", selectedOption.defaultDays)
      } else {
        setSelectedLeaveTypeDefaultDays(0)
        form.setValue("totalDays", 0)
      }

      // Set max days if available
      if (selectedOption.maxDays !== undefined && selectedOption.maxDays > 0) {
        setSelectedLeaveTypeMaxDays(selectedOption.maxDays)
      } else {
        setSelectedLeaveTypeMaxDays(null)
      }
    } else {
      form.setValue("leaveTypeId", 1)
      setSelectedLeaveTypeDefaultDays(0)
      setSelectedLeaveTypeMaxDays(null)
      form.setValue("totalDays", 0)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4"
          >
            {/* Leave Type Selection */}
            <LeaveTypeAutocomplete
              form={form}
              name="leaveTypeId"
              label="Leave Type"
              isRequired={true}
              onChangeEvent={handleLeaveTypeChange}
            />

            {/* Leave Type Details Display */}
            {(selectedLeaveTypeDefaultDays > 0 ||
              selectedLeaveTypeMaxDays !== null) && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted/30 border-0">
                  <CardContent className="p-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs font-medium">
                        Default Days
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="px-2 py-1 text-xs"
                        >
                          {selectedLeaveTypeDefaultDays || "N/A"} days
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-0">
                  <CardContent className="p-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs font-medium">
                        Max Days
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-2 py-1 text-xs">
                          {selectedLeaveTypeMaxDays || "N/A"} days
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Date Range */}
            <CustomDateNew
              form={form}
              name="startDate"
              label="Start Date"
              isRequired={true}
            />
            <CustomDateNew
              form={form}
              name="endDate"
              label="End Date"
              isRequired={true}
            />

            {/* Days Calculation */}
            {calculateDays() > 0 && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Days:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{calculateDays()} days</Badge>
                      <span className="text-muted-foreground text-xs">
                        (Form value: {form.watch("totalDays")})
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reason */}
            <CustomTextarea
              form={form}
              name="reason"
              label="Reason for Leave"
              isRequired={true}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
