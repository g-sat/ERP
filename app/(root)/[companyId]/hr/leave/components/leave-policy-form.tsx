"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { ILeavePolicy } from "@/interfaces/leave"
import { LeavePolicySchemaType, leavePolicySchema } from "@/schemas/leave"
import { zodResolver } from "@hookform/resolvers/zod"
import { Settings } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
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
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import LeaveTypeAutocomplete from "@/components/autocomplete/autocomplete-leavetype"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface LeavePolicyFormProps {
  policies: ILeavePolicy[]
  onSubmit: (
    data: LeavePolicySchemaType
  ) => Promise<ApiResponse<ILeavePolicy> | void>
}

export function LeavePolicyForm({ policies, onSubmit }: LeavePolicyFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<ILeavePolicy | null>(
    null
  )

  const form = useForm<LeavePolicySchemaType>({
    resolver: zodResolver(leavePolicySchema),
    defaultValues: {
      leavePolicyId: 0, // 0 for new policies, will be set by backend
      companyId: 1,
      leaveTypeId: 1,
      name: "",
      description: "",
      defaultDays: 0,
      maxDays: 30,
      minDays: 0,
      advanceNoticeDays: 0,
      maxConsecutiveDays: 30,
      requiresApproval: true,
      requiresDocument: false,
      isActive: true,
    },
  })

  // Listen for custom event to open form
  useEffect(() => {
    const handleOpenForm = (event: CustomEvent) => {
      if (event.detail.mode === "add") {
        setSelectedPolicy(null)
        form.reset({
          leavePolicyId: 0, // 0 for new policies
          companyId: 1,
          leaveTypeId: 1,
          name: "",
          description: "",
          defaultDays: 0,
          maxDays: 30,
          minDays: 0,
          advanceNoticeDays: 0,
          maxConsecutiveDays: 30,
          requiresApproval: true,
          requiresDocument: false,
          isActive: true,
        })
        setOpen(true)
      } else if (event.detail.mode === "edit" && event.detail.policy) {
        const policy = event.detail.policy
        setSelectedPolicy(policy)
        form.reset({
          leavePolicyId: policy.leavePolicyId,
          companyId: policy.companyId,
          leaveTypeId: policy.leaveTypeId,
          name: policy.name,
          description: policy.description || "",
          defaultDays: policy.defaultDays,
          maxDays: policy.maxDays,
          minDays: policy.minDays,
          advanceNoticeDays: policy.advanceNoticeDays,
          maxConsecutiveDays: policy.maxConsecutiveDays,
          requiresApproval: policy.requiresApproval,
          requiresDocument: policy.requiresDocument,
          isActive: policy.isActive,
        })
        setOpen(true)
      }
    }

    window.addEventListener("openPolicyForm", handleOpenForm as EventListener)

    return () => {
      window.removeEventListener(
        "openPolicyForm",
        handleOpenForm as EventListener
      )
    }
  }, [form])

  const handleSubmit = async (data: LeavePolicySchemaType) => {
    try {
      console.log("LeavePolicyForm handleSubmit called with data:", data)
      console.log("Form is valid:", form.formState.isValid)
      console.log("Form errors:", form.formState.errors)

      setLoading(true)
      const response = await onSubmit(data)
      console.log("LeavePolicyForm onSubmit completed with response:", response)

      // Check the response and handle accordingly
      if (response && typeof response === "object" && "result" in response) {
        if (response.result === 1) {
          // Success - close form and show success message
          setOpen(false)
          form.reset()
          setSelectedPolicy(null)
          // Success message is handled by the page component
        } else {
          // Error - keep form open, error message is handled by the page component
          console.log("Form submission failed, keeping form open")
        }
      } else {
        // No response or unexpected format - keep form open
        console.log("No response or unexpected format, keeping form open")
      }
    } catch (error) {
      console.error("Failed to submit leave policy:", error)
      // Keep form open on error
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedPolicy(null)
    form.reset()
  }

  // Handle empty or invalid data
  if (!policies || policies.length === 0) {
    return (
      <div className="py-8 text-center">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No leave policies found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Start by creating your first leave policy.
        </p>
      </div>
    )
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
            {selectedPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <LeaveTypeAutocomplete
                form={form}
                name="leaveTypeId"
                label="Leave Type"
                isRequired
              />
              <CustomInput
                form={form}
                name="name"
                label="Policy Name"
                isRequired
              />
            </div>

            <CustomTextarea
              form={form}
              name="description"
              label="Description"
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                form={form}
                name="defaultDays"
                label="Default Days"
                type="number"
                isRequired
              />
              <CustomInput
                form={form}
                name="maxDays"
                label="Maximum Days"
                type="number"
                isRequired
              />
              <CustomInput
                form={form}
                name="minDays"
                label="Minimum Days"
                type="number"
                isRequired
              />
              <CustomInput
                form={form}
                name="advanceNoticeDays"
                label="Advance Notice Days"
                type="number"
                isRequired
              />
            </div>

            <CustomInput
              form={form}
              name="maxConsecutiveDays"
              label="Maximum Consecutive Days"
              type="number"
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requires Approval
                      </FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Whether this leave type requires approval
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiresDocument"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requires Document
                      </FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Whether this leave type requires documentation
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-muted-foreground text-sm">
                      Whether this policy is currently active
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : selectedPolicy
                    ? "Update Policy"
                    : "Create Policy"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
