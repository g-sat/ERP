"use client"

import React, { useState } from "react"
import { Leave, LeaveFormData } from "@/interfaces/leave"
import { leaveSchema } from "@/schemas/leave"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock, FileText, Plus, Upload, X } from "lucide-react"
import { useForm } from "react-hook-form"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"

interface LeaveRequestFormProps {
  leave?: Leave
  onSubmit: (data: LeaveFormData) => Promise<void>
  trigger?: React.ReactNode
  mode?: "create" | "edit"
  employees?: Array<{
    id: string
    name: string
    employeeCode: string
    photo?: string
    department?: string
  }>
}

export function LeaveRequestForm({
  leave,
  onSubmit,
  trigger,
  mode = "create",
  employees = [],
}: LeaveRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>(
    leave?.attachments || []
  )

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      employeeId: leave?.employeeId || "",
      leaveType: leave?.leaveType || "CASUAL",
      leaveCategory: leave?.leaveCategory || "FULL_DAY",
      startDate: leave?.startDate || "",
      endDate: leave?.endDate || "",
      reason: leave?.reason || "",
      notes: leave?.notes || "",
      attachments: leave?.attachments || [],
    },
  })

  const handleSubmit = async (data: LeaveFormData) => {
    try {
      setLoading(true)
      await onSubmit({ ...data, attachments })
      setOpen(false)
      form.reset()
      setAttachments([])
    } catch (error) {
      console.error("Failed to submit leave request:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you would upload files to server and get URLs
      const newAttachments = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      )
      setAttachments((prev) => [...prev, ...newAttachments])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateDays = () => {
    const startDate = form.watch("startDate")
    const endDate = form.watch("endDate")
    const category = form.watch("leaveCategory")

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

      if (category === "HALF_DAY") {
        return diffDays * 0.5
      }
      return diffDays
    }
    return 0
  }

  const selectedEmployee = employees.find(
    (emp) => emp.id === form.watch("employeeId")
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {mode === "create" ? "Request Leave" : "Edit Leave"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Request Leave" : "Edit Leave Request"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={employee.photo} />
                              <AvatarFallback>
                                {employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{employee.name}</span>
                            <Badge variant="outline">
                              {employee.employeeCode}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Employee Info */}
            {selectedEmployee && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedEmployee.photo} />
                      <AvatarFallback>
                        {selectedEmployee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedEmployee.name}</div>
                      <div className="text-sm text-gray-500">
                        {selectedEmployee.employeeCode} •{" "}
                        {selectedEmployee.department}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

              {/* Leave Category */}
              <FormField
                control={form.control}
                name="leaveCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FULL_DAY">Full Day</SelectItem>
                        <SelectItem value="HALF_DAY">Half Day</SelectItem>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="MULTIPLE_DAYS">
                          Multiple Days
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={
                          form.watch("startDate") ||
                          new Date().toISOString().split("T")[0]
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Days Display */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Total Days</span>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {calculateDays()}{" "}
                    {form.watch("leaveCategory") === "HALF_DAY"
                      ? "Half Days"
                      : "Days"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leave</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a detailed reason for your leave request..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachments */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <FormLabel>Attachments (Optional)</FormLabel>
              </div>

              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload files
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, DOC, JPG, PNG up to 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Uploaded Files:</h4>
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">File {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                  ? "Submitting..."
                  : mode === "create"
                    ? "Submit Request"
                    : "Update Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
