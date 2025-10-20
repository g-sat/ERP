"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ILeaveBalance } from "@/interfaces/leave"
import { LeaveBalanceSchemaType, leaveBalanceSchema } from "@/schemas/leave"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import {
  EmployeeAutocomplete,
  LeaveTypeAutocomplete,
} from "@/components/autocomplete"
import CustomInput from "@/components/custom/custom-input"

interface LeaveBalanceFormProps {
  onSubmit: (
    data: LeaveBalanceSchemaType
  ) => Promise<ApiResponse<ILeaveBalance> | void>
}

export function LeaveBalanceForm({ onSubmit }: LeaveBalanceFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<ILeaveBalance | null>(
    null
  )

  const form = useForm<LeaveBalanceSchemaType>({
    resolver: zodResolver(leaveBalanceSchema),
    defaultValues: {
      leaveBalanceId: 0,
      employeeId: 0,
      leaveTypeId: 1,
      totalAllocated: 0,
      totalUsed: 0,
      totalPending: 0,
      remainingBalance: 0,
      year: new Date().getFullYear(),
    },
  })

  // Listen for custom event to open form
  useEffect(() => {
    const handleOpenForm = (event: CustomEvent) => {
      if (event.detail?.mode === "add") {
        // Clear form and reset state before opening
        setSelectedBalance(null)
        form.reset({
          leaveBalanceId: 0,
          employeeId: 0,
          leaveTypeId: 1,
          totalAllocated: 0,
          totalUsed: 0,
          totalPending: 0,
          remainingBalance: 0,
          year: new Date().getFullYear(),
        })
        setOpen(true)
      } else if (event.detail?.mode === "edit" && event.detail?.balance) {
        setSelectedBalance(event.detail.balance)
        form.reset(event.detail.balance)
        setOpen(true)
      }
    }

    window.addEventListener("openBalanceForm", handleOpenForm as EventListener)
    return () => {
      window.removeEventListener(
        "openBalanceForm",
        handleOpenForm as EventListener
      )
    }
  }, [form])

  const handleSubmit = async (data: LeaveBalanceSchemaType) => {
    try {
      setLoading(true)
      const response = await onSubmit(data)

      if (response && typeof response === "object" && "result" in response) {
        if (response.result === 1) {
          // Success - close form and reset
          setOpen(false)
          setSelectedBalance(null)
          // Reset form to default values
          form.reset({
            leaveBalanceId: 0,
            employeeId: 0,
            leaveTypeId: 1,
            totalAllocated: 0,
            totalUsed: 0,
            totalPending: 0,
            remainingBalance: 0,
            year: new Date().getFullYear(),
          })
        } else {
          // Error - keep form open, error message handled by parent
          console.log("Form submission failed, keeping form open")
        }
      } else {
        // No response or unexpected format - keep form open
        console.log("No response or unexpected format, keeping form open")
      }
    } catch (error) {
      console.error("Failed to submit leave balance:", error)
      // Keep form open on error
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedBalance(null)
    // Reset form to default values
    form.reset({
      leaveBalanceId: 0,
      employeeId: 0,
      leaveTypeId: 1,
      totalAllocated: 0,
      totalUsed: 0,
      totalPending: 0,
      remainingBalance: 0,
      year: new Date().getFullYear(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Only allow closing if explicitly set to false (not when clicking outside)
        if (!newOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedBalance ? "Edit Leave Balance" : "Add New Leave Balance"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <EmployeeAutocomplete
                form={form}
                name="employeeId"
                label="Employee"
                isRequired
              />
              <LeaveTypeAutocomplete
                form={form}
                name="leaveTypeId"
                label="Leave Type"
                isRequired
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                form={form}
                name="totalAllocated"
                label="Total Allocated Days"
                type="number"
                isRequired
              />
              <CustomInput
                form={form}
                name="totalUsed"
                label="Total Used Days"
                type="number"
                isRequired
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                form={form}
                name="totalPending"
                label="Total Pending Days"
                type="number"
                isRequired
              />
              <CustomInput
                form={form}
                name="remainingBalance"
                label="Remaining Balance"
                type="number"
                isRequired
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CustomInput
                form={form}
                name="year"
                label="Year"
                type="number"
                isRequired
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : selectedBalance
                    ? "Update Balance"
                    : "Create Balance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
