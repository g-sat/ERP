"use client"

import { useEffect, useState } from "react"
import { LoanRepaymentFormData, loanRepaymentSchema } from "@/schemas/loan"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CustomDateNoPast } from "@/components/custom/custom-date-no-past"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface LoanRepaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId: number | null
  onSubmit: (data: LoanRepaymentFormData) => Promise<void>
}

export function LoanRepaymentForm({
  open,
  onOpenChange,
  loanId,
  onSubmit,
}: LoanRepaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoanRepaymentFormData>({
    resolver: zodResolver(loanRepaymentSchema),
    defaultValues: {
      repaymentId: 0,
      loanRequestId: loanId || 0,
      installmentNumber: 1,
      dueDate: new Date(),
      emiAmount: 0,
      principalComponent: 0,
      interestComponent: 0,
      outstandingBalance: 0,
      statusId: 1,
      paymentMethod: "",
      transactionReference: "",
      comments: "",
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        repaymentId: 0,
        loanRequestId: loanId || 0,
        installmentNumber: 1,
        dueDate: new Date(),
        emiAmount: 0,
        principalComponent: 0,
        interestComponent: 0,
        outstandingBalance: 0,
        statusId: 1,
        paymentMethod: "",
        transactionReference: "",
        comments: "",
      })
    }
  }, [open, loanId, form])

  const handleSubmit = async (data: LoanRepaymentFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error("Error submitting loan repayment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record Loan Repayment</DialogTitle>
        </DialogHeader>

        {loanId && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Loan ID:</span>
                <span className="ml-2">
                  LOAN-{String(loanId).padStart(5, "0")}
                </span>
              </div>
              <div>
                <span className="font-medium">Outstanding Balance:</span>
                <span className="ml-2">AED 2,500.00</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <CustomDateNoPast
                form={form}
                name="dueDate"
                label="Payment Date"
                isRequired={true}
                isDisabled={isLoading}
                placeholder="Select payment date"
                allowToday={true}
              />

              <CustomInput
                form={form}
                name="emiAmount"
                label="Payment Amount (AED)"
                type="number"
                placeholder="Enter payment amount"
                isRequired={true}
                isDisabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                form={form}
                name="principalComponent"
                label="Principal Amount (AED)"
                type="number"
                placeholder="Enter principal amount"
                isRequired={true}
                isDisabled={isLoading}
              />

              <CustomInput
                form={form}
                name="interestComponent"
                label="Interest Amount (AED)"
                type="number"
                placeholder="Enter interest amount"
                isRequired={true}
                isDisabled={isLoading}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Salary Deduction">
                        Salary Deduction
                      </SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CustomInput
              form={form}
              name="transactionReference"
              label="Reference Number"
              placeholder="Enter reference number"
              isDisabled={isLoading}
            />

            <CustomTextarea
              form={form}
              name="comments"
              label="Remarks"
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
                {isLoading ? "Processing..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
