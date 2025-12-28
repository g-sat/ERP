"use client"

import { useState } from "react"
import { ILoanRequest } from "@/interfaces/loan"
import {
  LoanDisbursementFormData,
  loanDisbursementSchema,
} from "@/schemas/loan"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { formatDateForApi } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { DisbursementStatusAutocomplete } from "@/components/autocomplete"
import { CustomDateNoPast } from "@/components/custom/custom-date-no-past"
import CustomInput from "@/components/custom/custom-input"

interface LoanDisbursementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanRequest: ILoanRequest | null
  onSubmit: (data: LoanDisbursementFormData) => Promise<void>
}

export function LoanDisbursementForm({
  open,
  onOpenChange,
  loanRequest,
  onSubmit,
}: LoanDisbursementFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoanDisbursementFormData>({
    resolver: zodResolver(loanDisbursementSchema),
    defaultValues: {
      disbursementId: 0,
      loanRequestId: loanRequest?.loanRequestId || 0,
      disbursementDate: new Date(),
      amount: loanRequest?.requestedAmount || 0,
      methodId: 3,
      transactionReference: "",
    },
  })

  const handleSubmit = async (data: LoanDisbursementFormData) => {
    setIsLoading(true)
    try {
      // Format dates for API submission
      const formattedData = {
        ...data,
        disbursementDate: formatDateForApi(data.disbursementDate) || "",
      }
      await onSubmit(formattedData)
      form.reset()
    } catch (error) {
      console.error("Error submitting loan disbursement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!loanRequest) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Loan Disbursement</DialogTitle>
        </DialogHeader>

        {/* Loan Request Details */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Request ID:</span>
              <span className="ml-2">
                REQ-{String(loanRequest.loanRequestId).padStart(5, "0")}
              </span>
            </div>
            <div>
              <span className="font-medium">Employee ID:</span>
              <span className="ml-2">
                EMP{String(loanRequest.employeeId).padStart(6, "0")}
              </span>
            </div>
            <div>
              <span className="font-medium">Approved Amount:</span>
              <span className="ml-2">
                AED {loanRequest.requestedAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium">EMI Amount:</span>
              <span className="ml-2">
                AED {loanRequest.desiredEMIAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <CustomDateNoPast
                form={form}
                name="disbursementDate"
                label="Disbursement Date"
                isDisabled={isLoading}
                placeholder="Select disbursement date"
                allowToday={true}
              />

              <CustomInput
                form={form}
                name="amount"
                label="Disbursement Amount (AED)"
                type="number"
                placeholder="Enter amount"
                isDisabled={isLoading}
              />
            </div>

            <DisbursementStatusAutocomplete
              form={form}
              name="methodId"
              label="Status"
              isDisabled={isLoading}
            />

            <CustomInput
              form={form}
              name="transactionReference"
              label="Reference Number"
              placeholder="Enter reference number"
              isDisabled={isLoading}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Disburse Loan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
