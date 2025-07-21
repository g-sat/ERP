"use client"

import { useEffect, useState } from "react"
import { IUser } from "@/interfaces/admin"
import { IUserLookup } from "@/interfaces/lookup"
import { NotificationHistory } from "@/interfaces/notification"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import {
  useGetUsersForNotification,
  useSendBulkNotifications,
} from "@/hooks/use-admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Form validation schema
const notificationFormSchema = z.object({
  type: z.enum([
    "document_expiry",
    "task_reminder",
    "system_update",
    "invoice_alert",
    "payment_reminder",
    "general_alert",
    "security_alert",
    "approval_request",
    "report_ready",
    "maintenance_scheduled",
  ]),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  body: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be less than 500 characters"),
  targetType: z.enum(["all_users", "specific_users", "preference_based"]),
  selectedUsers: z.array(z.number()).optional(),
  module: z.string().optional(),
  recordId: z.string().optional(),
  action: z.string().optional(),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

// Notification type descriptions and targeting rules
const notificationTypeConfig = {
  document_expiry: {
    label: "Document Expiry",
    description: "Alerts when documents are about to expire",
    targetRule: "Send to users with document expiry screen access",
    defaultModule: "doc-expiry",
  },
  task_reminder: {
    label: "Task Reminder",
    description: "Reminders for pending tasks and deadlines",
    targetRule: "Send to users with task management access",
    defaultModule: "operations",
  },
  system_update: {
    label: "System Update",
    description: "Important system updates and maintenance",
    targetRule: "Send to all users",
    defaultModule: "system",
  },
  invoice_alert: {
    label: "Invoice Alert",
    description: "Invoice-related notifications and alerts",
    targetRule: "Send to users with invoice access",
    defaultModule: "ar",
  },
  payment_reminder: {
    label: "Payment Reminder",
    description: "Payment due reminders and confirmations",
    targetRule: "Send to users with payment access",
    defaultModule: "ap",
  },
  general_alert: {
    label: "General Alert",
    description: "General system notifications and announcements",
    targetRule: "Send to all users",
    defaultModule: "general",
  },
  security_alert: {
    label: "Security Alert",
    description: "Security-related notifications and warnings",
    targetRule: "Send to all users",
    defaultModule: "security",
  },
  approval_request: {
    label: "Approval Request",
    description: "Requests for document or action approval",
    targetRule: "Send to users with approval rights",
    defaultModule: "approvals",
  },
  report_ready: {
    label: "Report Ready",
    description: "Notifications when reports are ready for download",
    targetRule: "Send to users who requested the report",
    defaultModule: "reports",
  },
  maintenance_scheduled: {
    label: "Maintenance Scheduled",
    description: "Scheduled maintenance notifications",
    targetRule: "Send to all users",
    defaultModule: "maintenance",
  },
}

export function NotificationForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      type: "general_alert",
      title: "",
      body: "",
      targetType: "preference_based",
      selectedUsers: [],
      module: "",
      recordId: "",
      action: "",
    },
  })

  const [selectedUsers, setSelectedUsers] = useState<IUserLookup[]>([])
  const [sending, setSending] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<IUserLookup[]>([])
  const [targetedUsers, setTargetedUsers] = useState<IUserLookup[]>([])

  const sendBulkNotifications = useSendBulkNotifications()
  const selectedType = form.watch("type")
  const targetType = form.watch("targetType")
  const { data: usersForNotification } =
    useGetUsersForNotification(selectedType)

  // Load available users from API
  useEffect(() => {
    if (usersForNotification?.data) {
      // Flatten the array of arrays and map to IUserLookup format
      const flattenedUsers = usersForNotification.data.flat()
      setAvailableUsers(
        flattenedUsers.map((user: IUser) => ({
          userId: user.userId,
          userCode: user.userCode,
          userName: user.userName,
        }))
      )
    }
  }, [usersForNotification?.data])

  // Update targeted users based on notification type and target type
  useEffect(() => {
    const type = form.getValues("type")
    const target = form.getValues("targetType")

    if (target === "all_users") {
      setTargetedUsers(availableUsers)
    } else if (target === "specific_users") {
      setTargetedUsers(selectedUsers)
    } else if (target === "preference_based") {
      // Filter users based on notification type preferences
      if (
        type === "maintenance_scheduled" ||
        type === "system_update" ||
        type === "general_alert" ||
        type === "security_alert"
      ) {
        // Send to all users for these types
        setTargetedUsers(availableUsers)
      } else {
        // For other types, filter based on user preferences (mock logic)
        setTargetedUsers(availableUsers)
      }
    }
  }, [selectedType, targetType, selectedUsers, availableUsers])

  // Handle user selection for specific users targeting
  const handleUserSelection = (user: IUserLookup | null) => {
    if (!user) return

    if (selectedUsers.find((u) => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u.userId !== user.userId))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  // Handle form submission
  const onSubmit = async (data: NotificationFormValues) => {
    try {
      setSending(true)

      // Validate that we have users to send to
      if (targetedUsers.length === 0) {
        toast.error("No users selected to receive this notification")
        return
      }

      // Prepare notifications for bulk send
      const notifications = targetedUsers.map((user) => ({
        userId: user.userId,
        companyId: 0, // Get from context
        type: data.type,
        title: data.title,
        body: data.body,
        data: {
          module:
            data.module || notificationTypeConfig[data.type].defaultModule,
          recordId: data.recordId,
          action: data.action,
        },
        navigation: data.module
          ? {
              type: "page",
              path: data.recordId
                ? `/${data.module}/${data.recordId}`
                : `/${data.module}`,
              module: data.module,
              recordId: data.recordId,
              action: data.action,
            }
          : undefined,
      }))

      // Send bulk notifications
      await sendBulkNotifications.mutateAsync({
        data: {
          notifications: notifications as unknown as NotificationHistory[],
        },
      })

      toast.success(
        `Notification sent successfully to ${targetedUsers.length} user(s)`
      )

      // Reset form
      form.reset()
      setSelectedUsers([])
      setTargetedUsers([])
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  const currentConfig = notificationTypeConfig[selectedType]

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Notification Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Type</CardTitle>
              <CardDescription>
                Choose the type of notification to send
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(notificationTypeConfig).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {config.label}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {config.description}
                                </span>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentConfig && (
                <div className="bg-muted mt-4 rounded-md p-3">
                  <p className="text-sm font-medium">Targeting Rule:</p>
                  <p className="text-muted-foreground text-sm">
                    {currentConfig.targetRule}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Content */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Content</CardTitle>
              <CardDescription>
                Enter the notification title and message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter notification title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter notification message"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Navigation Options */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Options</CardTitle>
              <CardDescription>
                Optional: Set where users will be directed when clicking the
                notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          currentConfig?.defaultModule ||
                          "e.g., ar, ap, doc-expiry"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recordId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., view, edit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Target Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Target Users</CardTitle>
              <CardDescription>
                Choose how to target users for this notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Targeting Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value="all_users" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Send to all users
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value="specific_users" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Send to specific users
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value="preference_based" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Send based on user preferences
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specific Users Selection */}
              {targetType === "specific_users" && (
                <div className="space-y-4">
                  <Label>Select Users</Label>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {availableUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="hover:bg-muted flex cursor-pointer items-center space-x-2 rounded-md border p-2"
                        onClick={() => handleUserSelection(user)}
                      >
                        <Checkbox
                          checked={selectedUsers.some(
                            (u) => u.userId === user.userId
                          )}
                          onChange={() => handleUserSelection(user)}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{user.userName}</span>
                          <span className="text-muted-foreground text-sm">
                            {user.userCode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Targeted Users Summary */}
              {targetedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Users who will receive this notification:</Label>
                  <div className="flex flex-wrap gap-2">
                    {targetedUsers.map((user) => (
                      <Badge key={user.userId} variant="secondary">
                        {user.userName}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Total: {targetedUsers.length} user(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={sending || targetedUsers.length === 0}
              size="lg"
            >
              {sending
                ? "Sending..."
                : `Send to ${targetedUsers.length} User(s)`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
