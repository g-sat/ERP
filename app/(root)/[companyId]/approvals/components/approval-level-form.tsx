"use client"

import { useEffect } from "react"
import { ApprovalLevel } from "@/interfaces/approval"
import {
  ApprovalLevelFormValues,
  approvalLevelSchema,
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

interface ApprovalLevelFormProps {
  initialData?: ApprovalLevel
  submitAction: (data: ApprovalLevelFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
}

export function ApprovalLevelForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
}: ApprovalLevelFormProps) {
  const form = useForm<ApprovalLevelFormValues>({
    resolver: zodResolver(approvalLevelSchema),
    defaultValues: {
      levelId: 0,
      processId: 0,
      levelNumber: 0,
      userRoleId: 0,
      levelName: "",
      isFinal: false,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        levelId: initialData.levelId,
        processId: initialData.processId,
        levelNumber: initialData.levelNumber,
        userRoleId: initialData.userRoleId,
        levelName: initialData.levelName,
        isFinal: initialData.isFinal,
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: ApprovalLevelFormValues) => {
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
            name="processId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter process ID"
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
            name="levelNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter level number"
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
            name="userRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Role ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter user role ID"
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
            name="levelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter level name"
                    disabled={isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFinal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Final Level</FormLabel>
                  <div className="text-muted-foreground text-sm">
                    Mark this as the final approval level
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
