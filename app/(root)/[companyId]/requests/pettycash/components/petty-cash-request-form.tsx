"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { formatDateForApi } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

// Schema for petty cash request form
const pettyCashRequestSchema = z.object({
  pettyCashId: z.number().default(0),
  requestDate: z.union([z.string(), z.date()]).optional(),
  amount: z.number().min(1, "Amount is required"),
  purpose: z
    .string()
    .min(1, "Purpose is required")
    .max(500, "Purpose must be less than 500 characters"),
  remarks: z.string().optional().default(""),
  attachments: z.string().optional().default(""),
})

type PettyCashRequestFormData = z.infer<typeof pettyCashRequestSchema>

interface PettyCashRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PettyCashRequestFormData) => Promise<void>
}

export function PettyCashRequestForm({
  open,
  onOpenChange,
  onSubmit,
}: PettyCashRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PettyCashRequestFormData>({
    resolver: zodResolver(pettyCashRequestSchema),
    defaultValues: {
      pettyCashId: 0,
      requestDate: "",
      amount: 0,
      purpose: "",
      remarks: "",
      attachments: "",
    },
  })

  // Reset form when dialog opens or closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        pettyCashId: 0,
        requestDate: "",
        amount: 0,
        purpose: "",
        remarks: "",
        attachments: "",
      })
    }
    onOpenChange(newOpen)
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        pettyCashId: 0,
        requestDate: "",
        amount: 0,
        purpose: "",
        remarks: "",
        attachments: "",
      })
    }
  }, [open, form])

  const handleSubmit = async (data: PettyCashRequestFormData) => {
    try {
      setIsLoading(true)
      // Format dates for API submission
      const formattedData = {
        ...data,
        requestDate: formatDateForApi(data.requestDate) || "",
      }
      await onSubmit(formattedData)
    } catch (error) {
      console.error("Error submitting petty cash request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Petty Cash Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <CustomDateNew
                form={form}
                name="requestDate"
                label="Request Date"
                isRequired={true}
                isDisabled={isLoading}
                placeholder="Select request date"
              />
              <CustomInput
                form={form}
                name="amount"
                label="Amount (AED)"
                type="number"
                placeholder="Enter amount"
                isRequired={true}
                isDisabled={isLoading}
              />
            </div>

            <CustomTextarea
              form={form}
              name="purpose"
              label="Purpose"
              placeholder="Enter the purpose of this expense"
              isRequired={true}
              isDisabled={isLoading}
            />

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              placeholder="Additional remarks (optional)"
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
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
