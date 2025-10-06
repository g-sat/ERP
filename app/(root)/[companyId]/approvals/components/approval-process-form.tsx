"use client"

import { useState } from "react"
import { IApprovalProcess } from "@/interfaces/approval"
import { approvalProcessSchema } from "@/schemas/approval"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

// TODO: These hooks need to be implemented or replaced with the new approval system
// import {
//   useSaveApprovalProcess,
//   useUpdateApprovalProcess,
// } from "@/hooks/use-approval"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch"

interface ApprovalProcessFormProps {
  mode: "create" | "edit" | "view"
  process?: IApprovalProcess
  onSuccess: () => void
  onCancel: () => void
}

export function ApprovalProcessForm({
  mode,
  process,
  onSuccess,
  onCancel,
}: ApprovalProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: These hooks need to be implemented
  // const saveProcess = useSaveApprovalProcess()
  // const updateProcess = useUpdateApprovalProcess()

  const form = useForm<IApprovalProcess>({
    resolver: zodResolver(approvalProcessSchema),
    defaultValues: {
      processId: process?.processId || 0,
      processName: process?.processName || "",
      moduleId: process?.moduleId || 1,
      transactionId: process?.transactionId || undefined,
      isActive: process?.isActive ?? true,
      createById: process?.createById || 0,
      createdDate: process?.createdDate || new Date().toISOString(),
    },
  })

  const onSubmit = async (data: IApprovalProcess) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement save/update functionality
      toast.success("Approval process functionality not yet implemented")
      onSuccess()
    } catch (error) {
      console.error("Error saving approval process:", error)
      toast.error("Failed to save approval process")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isViewMode = mode === "view"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Process Name */}
        <FormField
          control={form.control}
          name="processName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Process Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter process name"
                  {...field}
                  disabled={isViewMode}
                />
              </FormControl>
              <FormDescription>
                A descriptive name for the approval process
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Module ID */}
        <FormField
          control={form.control}
          name="moduleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module ID</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">AR Invoice (1)</SelectItem>
                    <SelectItem value="2">AP Invoice (2)</SelectItem>
                    <SelectItem value="3">Purchase Order (3)</SelectItem>
                    <SelectItem value="4">Expense (4)</SelectItem>
                    <SelectItem value="5">Leave Request (5)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                The module this approval process applies to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction ID */}
        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter transaction ID"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value ? parseInt(value) : undefined)
                  }}
                  disabled={isViewMode}
                />
              </FormControl>
              <FormDescription>
                Specific transaction type within the module
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Active */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Enable or disable this approval process
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isViewMode}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        {!isViewMode && (
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Create Process" : "Update Process"}
            </Button>
          </div>
        )}

        {isViewMode && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
