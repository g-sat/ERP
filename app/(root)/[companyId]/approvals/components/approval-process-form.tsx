"use client"

import { useEffect } from "react"
import { ApprovalProcess } from "@/interfaces/approval"
import {
  ApprovalProcessFormValues,
  approvalProcessSchema,
} from "@/schemas/approval"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface ApprovalProcessFormProps {
  initialData?: ApprovalProcess
  submitAction: (data: ApprovalProcessFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
}

export function ApprovalProcessForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
}: ApprovalProcessFormProps) {
  const form = useForm<ApprovalProcessFormValues>({
    resolver: zodResolver(approvalProcessSchema),
    defaultValues: {
      processId: 0,
      processName: "",
      moduleId: 0,
      transactionId: undefined,
      companyId: undefined,
      isActive: true,
      createById: 0,
      createdDate: undefined,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        processId: initialData.processId,
        processName: initialData.processName,
        moduleId: initialData.moduleId,
        transactionId: initialData.transactionId,
        companyId: initialData.companyId,
        isActive: initialData.isActive,
        createById: initialData.createById,
        createdDate: initialData.createdDate
          ? new Date(initialData.createdDate)
          : undefined,
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: ApprovalProcessFormValues) => {
    try {
      await submitAction(data)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="processName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter process name"
                    disabled={isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moduleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Module ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter module ID"
                    disabled={isReadOnly}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter transaction ID (optional)"
                    disabled={isReadOnly}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter company ID (optional)"
                    disabled={isReadOnly}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createById"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Created By ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter creator ID"
                    disabled={isReadOnly}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-muted-foreground text-sm">
                    Enable or disable this approval process
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isReadOnly}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
