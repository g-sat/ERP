"use client"

import { useState } from "react"
import { IApprovalLevel, IApprovalProcess } from "@/interfaces/approval"
import { approvalLevelSchema } from "@/schemas/approval"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

// TODO: These hooks need to be implemented or replaced with the new approval system
// import {
//   useSaveApprovalLevel,
//   useUpdateApprovalLevel,
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

interface ApprovalLevelFormProps {
  mode: "create" | "edit" | "view"
  level?: IApprovalLevel
  processes: IApprovalProcess[]
  onSuccess: () => void
  onCancel: () => void
}

export function ApprovalLevelForm({
  mode,
  level,
  processes,
  onSuccess,
  onCancel,
}: ApprovalLevelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: These hooks need to be implemented
  // const saveLevel = useSaveApprovalLevel()
  // const updateLevel = useUpdateApprovalLevel()

  const form = useForm<IApprovalLevel>({
    resolver: zodResolver(approvalLevelSchema),
    defaultValues: {
      levelId: level?.levelId || 0,
      processId: level?.processId || 1,
      levelNumber: level?.levelNumber || 1,
      userRoleId: level?.userRoleId || 1,
      isFinal: level?.isFinal ?? false,
    },
  })

  const onSubmit = async (data: IApprovalLevel) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement save/update functionality
      console.log("Saving approval level:", data)
      toast.success("Approval level functionality not yet implemented")
      onSuccess()
    } catch (error) {
      console.error("Error saving approval level:", error)
      toast.error("Failed to save approval level")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isViewMode = mode === "view"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Process Selection */}
        <FormField
          control={form.control}
          name="processId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval Process</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approval process" />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process) => (
                      <SelectItem
                        key={process.processId}
                        value={process.processId.toString()}
                      >
                        {process.processName} (ID: {process.processId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                The approval process this level belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Level Number */}
        <FormField
          control={form.control}
          name="levelNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level Number</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter level number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  disabled={isViewMode}
                />
              </FormControl>
              <FormDescription>
                The sequential order of this level in the approval workflow
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* User Role ID */}
        <FormField
          control={form.control}
          name="userRoleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Role</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin (1)</SelectItem>
                    <SelectItem value="2">Manager (2)</SelectItem>
                    <SelectItem value="3">Clerk (3)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                The user role that can approve at this level
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Final */}
        <FormField
          control={form.control}
          name="isFinal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Final Level</FormLabel>
                <FormDescription>
                  Mark this as the final approval level
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
              {mode === "create" ? "Create Level" : "Update Level"}
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
