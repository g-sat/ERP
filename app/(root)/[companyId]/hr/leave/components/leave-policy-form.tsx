"use client"

import React, { useState } from "react"
import { LeavePolicy, LeavePolicyFormData } from "@/interfaces/leave"
import { leavePolicySchema } from "@/schemas/leave"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Settings } from "lucide-react"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea"

interface LeavePolicyFormProps {
  policy?: LeavePolicy
  onSubmit: (data: LeavePolicyFormData) => Promise<void>
  trigger?: React.ReactNode
  mode?: "create" | "edit"
}

export function LeavePolicyForm({
  policy,
  onSubmit,
  trigger,
  mode = "create",
}: LeavePolicyFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<LeavePolicyFormData>({
    resolver: zodResolver(leavePolicySchema),
    defaultValues: {
      leaveType: policy?.leaveType || "CASUAL",
      name: policy?.name || "",
      description: policy?.description || "",
      defaultDays: policy?.defaultDays || 0,
      maxDays: policy?.maxDays || 30,
      minDays: policy?.minDays || 0,
      advanceNoticeDays: policy?.advanceNoticeDays || 0,
      maxConsecutiveDays: policy?.maxConsecutiveDays || 30,
      requiresApproval: policy?.requiresApproval ?? true,
      requiresDocument: policy?.requiresDocument ?? false,
      isActive: policy?.isActive ?? true,
    },
  })

  const handleSubmit = async (data: LeavePolicyFormData) => {
    try {
      setLoading(true)
      await onSubmit(data)
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error("Failed to submit leave policy:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "CASUAL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "SICK":
        return "bg-red-100 text-red-800 border-red-200"
      case "ANNUAL":
        return "bg-green-100 text-green-800 border-green-200"
      case "MATERNITY":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "PATERNITY":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "BEREAVEMENT":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "UNPAID":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "COMPENSATORY":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "OTHER":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {mode === "create" ? "Add Policy" : "Edit Policy"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Leave Policy" : "Edit Leave Policy"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Leave Type */}
                  <FormField
                    control={form.control}
                    name="leaveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASUAL">Casual Leave</SelectItem>
                            <SelectItem value="SICK">Sick Leave</SelectItem>
                            <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                            <SelectItem value="MATERNITY">
                              Maternity Leave
                            </SelectItem>
                            <SelectItem value="PATERNITY">
                              Paternity Leave
                            </SelectItem>
                            <SelectItem value="BEREAVEMENT">
                              Bereavement Leave
                            </SelectItem>
                            <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                            <SelectItem value="COMPENSATORY">
                              Compensatory Leave
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Policy Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter policy name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter policy description..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selected Leave Type Display */}
                {form.watch("leaveType") && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Selected Type:
                    </span>
                    <Badge
                      variant="outline"
                      className={getLeaveTypeColor(form.watch("leaveType"))}
                    >
                      {form.watch("leaveType").replace("_", " ")}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leave Duration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Leave Duration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Default Days */}
                  <FormField
                    control={form.control}
                    name="defaultDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Maximum Days */}
                  <FormField
                    control={form.control}
                    name="maxDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Minimum Days */}
                  <FormField
                    control={form.control}
                    name="minDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Advance Notice Days */}
                  <FormField
                    control={form.control}
                    name="advanceNoticeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Notice (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Maximum Consecutive Days */}
                  <FormField
                    control={form.control}
                    name="maxConsecutiveDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Consecutive Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Approval Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Requires Approval */}
                  <FormField
                    control={form.control}
                    name="requiresApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Requires Approval
                          </FormLabel>
                          <div className="text-sm text-gray-500">
                            Leave requests require manager approval
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

                  {/* Requires Document */}
                  <FormField
                    control={form.control}
                    name="requiresDocument"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Requires Document
                          </FormLabel>
                          <div className="text-sm text-gray-500">
                            Supporting documents are required
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

                {/* Policy Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Policy
                        </FormLabel>
                        <div className="text-sm text-gray-500">
                          Enable this policy for leave requests
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
              </CardContent>
            </Card>

            {/* Policy Summary */}
            <Card>
              <CardContent className="p-4">
                <h4 className="mb-3 font-medium">Policy Summary</h4>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Leave Type:</span>
                      <Badge
                        variant="outline"
                        className={getLeaveTypeColor(form.watch("leaveType"))}
                      >
                        {form.watch("leaveType")?.replace("_", " ") ||
                          "Not selected"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Default Days:</span>
                      <span className="font-medium">
                        {form.watch("defaultDays") || 0} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max Days:</span>
                      <span className="font-medium">
                        {form.watch("maxDays") || 0} days
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Advance Notice:</span>
                      <span className="font-medium">
                        {form.watch("advanceNoticeDays") || 0} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Requires Approval:</span>
                      <span className="font-medium">
                        {form.watch("requiresApproval") ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Requires Document:</span>
                      <span className="font-medium">
                        {form.watch("requiresDocument") ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : mode === "create"
                    ? "Create Policy"
                    : "Update Policy"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
