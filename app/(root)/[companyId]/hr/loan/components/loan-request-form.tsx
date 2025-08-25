"use client"

import { useEffect, useState } from "react"
import { LoanRequestFormData, loanRequestSchema } from "@/schemas/loans"
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
import EmployeeAutocomplete from "@/components/ui-custom/autocomplete-employee"
import LoanRequestStatusAutocomplete from "@/components/ui-custom/autocomplete-loanrequest-status"
import LoanTypeAutocomplete from "@/components/ui-custom/autocomplete-loantype"
import { CustomDateNoPast } from "@/components/ui-custom/custom-date-no-past"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface LoanRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: LoanRequestFormData) => Promise<void>
}

export function LoanRequestForm({
  open,
  onOpenChange,
  onSubmit,
}: LoanRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoanRequestFormData>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      loanRequestId: 0,
      loanTypeId: 0,
      employeeId: 0,
      requestDate: new Date(),
      requestedAmount: 0,
      desiredEMIAmount: 0,
      emiStartDate: new Date(),
      calculatedTermMonths: 0,
      remarks: "",
      statusId: 1501,
    },
  })

  // Reset form when dialog opens or closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when dialog closes
      form.reset({
        loanRequestId: 0,
        loanTypeId: 0,
        employeeId: 0,
        requestDate: new Date(),
        requestedAmount: 0,
        desiredEMIAmount: 0,
        emiStartDate: new Date(),
        calculatedTermMonths: 0,
        remarks: "",
        statusId: 1501,
      })
    }
    onOpenChange(newOpen)
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        loanRequestId: 0,
        loanTypeId: 0,
        employeeId: 0,
        requestDate: new Date(),
        requestedAmount: 0,
        desiredEMIAmount: 0,
        emiStartDate: new Date(),
        calculatedTermMonths: 0,
        remarks: "",
        statusId: 1501,
      })
    }
  }, [open, form])

  // Calculate term months and closing date when amount or EMI changes
  const calculateLoanDetails = (
    requestedAmount: number,
    desiredEMI: number,
    emiStartDate: Date
  ) => {
    if (requestedAmount > 0 && desiredEMI > 0) {
      // Calculate total installments (rounded up)
      const totalInstallments = Math.ceil(requestedAmount / desiredEMI)

      // Calculate term in months
      const termMonths = totalInstallments

      // Calculate closing date (EMI start date + term months)
      const closingDate = new Date(emiStartDate)
      closingDate.setMonth(closingDate.getMonth() + termMonths)

      return {
        calculatedTermMonths: termMonths,
        totalInstallments: totalInstallments,
        closingDate: closingDate,
        totalPayableAmount: totalInstallments * desiredEMI,
      }
    }
    return {
      calculatedTermMonths: 0,
      totalInstallments: 0,
      closingDate: emiStartDate,
      totalPayableAmount: 0,
    }
  }

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const requestedAmount = parseFloat(e.target.value) || 0
    const desiredEMI = form.getValues("desiredEMIAmount") || 0
    const emiStartDateValue = form.getValues("emiStartDate")
    const emiStartDate = emiStartDateValue
      ? new Date(emiStartDateValue)
      : new Date()

    const calculations = calculateLoanDetails(
      requestedAmount,
      desiredEMI,
      emiStartDate
    )

    form.setValue("calculatedTermMonths", calculations.calculatedTermMonths)
  }

  // Handle EMI change
  const handleEMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const desiredEMI = parseFloat(e.target.value) || 0
    const requestedAmount = form.getValues("requestedAmount") || 0
    const emiStartDateValue = form.getValues("emiStartDate")
    const emiStartDate = emiStartDateValue
      ? new Date(emiStartDateValue)
      : new Date()

    const calculations = calculateLoanDetails(
      requestedAmount,
      desiredEMI,
      emiStartDate
    )

    form.setValue("calculatedTermMonths", calculations.calculatedTermMonths)
  }

  // Handle request date change
  const handleRequestDateChange = (date: Date | null) => {
    if (date) {
      // Update EMI start date to be after request date
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      form.setValue("emiStartDate", nextDay)

      // Recalculate loan details
      const requestedAmount = form.getValues("requestedAmount") || 0
      const desiredEMI = form.getValues("desiredEMIAmount") || 0

      const calculations = calculateLoanDetails(
        requestedAmount,
        desiredEMI,
        nextDay
      )

      form.setValue("calculatedTermMonths", calculations.calculatedTermMonths)
    }
  }

  // Handle EMI start date change
  const handleEMIStartDateChange = (date: Date | null) => {
    if (date) {
      const requestedAmount = form.getValues("requestedAmount") || 0
      const desiredEMI = form.getValues("desiredEMIAmount") || 0

      const calculations = calculateLoanDetails(
        requestedAmount,
        desiredEMI,
        date
      )

      form.setValue("calculatedTermMonths", calculations.calculatedTermMonths)
    }
  }

  // Get minimum date for EMI start (request date + 1 day)
  const getMinEMIDate = () => {
    const requestDate = form.getValues("requestDate")
    if (requestDate) {
      const minDate = new Date(requestDate)
      minDate.setDate(minDate.getDate() + 1)
      return minDate
    }
    return new Date()
  }

  const handleSubmit = async (data: LoanRequestFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      // Reset form with default values
      form.reset({
        loanRequestId: 0,
        loanTypeId: 0,
        employeeId: 0,
        requestDate: new Date(),
        requestedAmount: 0,
        desiredEMIAmount: 0,
        emiStartDate: new Date(),
        calculatedTermMonths: 0,
        remarks: "",
        statusId: 1501,
      })
    } catch (error) {
      console.error("Error submitting loan request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[600px] overflow-y-auto sm:w-[80vw] lg:w-[60vw]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            New Loan Request
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LoanTypeAutocomplete
                form={form}
                name="loanTypeId"
                label="Loan Type"
                isRequired
                isDisabled={isLoading}
              />
              <EmployeeAutocomplete
                form={form}
                name="employeeId"
                label="Employee"
                isRequired
                isDisabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomDateNoPast
                form={form}
                name="requestDate"
                label="Request Date"
                isRequired
                isDisabled={isLoading}
                onChangeEvent={handleRequestDateChange}
                placeholder="Select request date"
                allowToday={true}
              />
              <CustomInput
                form={form}
                name="requestedAmount"
                label="Requested Amount"
                type="number"
                placeholder="Enter loan amount"
                isRequired={true}
                isDisabled={isLoading}
                onChangeEvent={handleAmountChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomInput
                form={form}
                name="desiredEMIAmount"
                label="Desired EMI Amount"
                type="number"
                placeholder="Enter EMI amount"
                isRequired={true}
                isDisabled={isLoading}
                onChangeEvent={handleEMIChange}
              />
              <CustomDateNoPast
                form={form}
                name="emiStartDate"
                label="EMI Start Date"
                isRequired
                isDisabled={isLoading}
                onChangeEvent={handleEMIStartDateChange}
                placeholder="Select EMI start date"
                allowToday={true}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomInput
                form={form}
                name="calculatedTermMonths"
                label="Term (Months)"
                type="number"
                placeholder="Auto-calculated"
                isRequired={true}
                isDisabled={true}
              />
              <LoanRequestStatusAutocomplete
                form={form}
                name="statusId"
                label="Loan Request Status"
                isRequired
                isDisabled={isLoading}
              />
            </div>

            {/* Loan Calculation Summary */}
            {form.watch("requestedAmount") > 0 &&
              form.watch("desiredEMIAmount") > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 text-sm font-semibold sm:text-base">
                    Loan Calculation Summary
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <span className="font-medium">Total Installments:</span>
                      <span className="ml-2">
                        {Math.ceil(
                          (form.watch("requestedAmount") || 0) /
                            (form.watch("desiredEMIAmount") || 1)
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Total Payable Amount:</span>
                      <span className="ml-2">
                        AED{" "}
                        {(
                          (form.watch("calculatedTermMonths") || 0) *
                          (form.watch("desiredEMIAmount") || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Closing Date:</span>
                      <span className="ml-2">
                        {(() => {
                          const emiStartDate = form.watch("emiStartDate")
                          const termMonths =
                            form.watch("calculatedTermMonths") || 0
                          if (emiStartDate && termMonths > 0) {
                            const closingDate = new Date(emiStartDate)
                            closingDate.setMonth(
                              closingDate.getMonth() + termMonths
                            )
                            return closingDate.toLocaleDateString()
                          }
                          return "N/A"
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Monthly EMI:</span>
                      <span className="ml-2">
                        AED{" "}
                        {(form.watch("desiredEMIAmount") || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            <CustomTextarea
              form={form}
              name="remarks"
              label="Reason"
              isDisabled={isLoading}
            />

            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
