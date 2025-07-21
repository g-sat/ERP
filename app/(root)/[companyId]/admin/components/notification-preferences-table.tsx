"use client"

import { useEffect, useState } from "react"
import { IUserLookup } from "@/interfaces/lookup"
import { NotificationPreferences } from "@/interfaces/notification"
import { useNotificationStore } from "@/stores/notification-store"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import UserAutocomplete from "@/components/ui-custom/autocomplete-user"

export function NotificationPreferencesTable() {
  const form = useForm()
  const [selectedUser, setSelectedUser] = useState<IUserLookup | null>(null)
  const [userPreferences, setUserPreferences] =
    useState<NotificationPreferences | null>(null)
  const [saving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { saveNotification, testApi } = useNotificationStore()

  // Default preferences structure
  const defaultPreferences: NotificationPreferences = {
    userId: 0,
    companyId: 0,
    emailNotifications: true,
    browserNotifications: true,
    notificationTypes: {
      documentExpiry: true,
      taskReminders: true,
      systemUpdates: true,
      invoiceAlerts: true,
      paymentReminders: true,
      generalAlerts: true,
    },
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }

  // Load user preferences when user changes
  useEffect(() => {
    if (selectedUser?.userId) {
      loadUserPreferences(selectedUser.userId)
    } else {
      setUserPreferences(null)
    }
  }, [selectedUser?.userId])

  const loadUserPreferences = async (userId: number) => {
    setIsLoading(true)
    try {
      // Test if preferences API is working
      const isPreferencesWorking = await testApi("preferences")
      if (!isPreferencesWorking) {
        toast.error("Preferences API is not available")
        setUserPreferences({ ...defaultPreferences, userId })
        return
      }

      // Load user preferences (you'll need to implement this in your store)
      // For now, we'll use default preferences
      setUserPreferences({ ...defaultPreferences, userId })
    } catch (error) {
      console.error("Error loading user preferences:", error)
      toast.error("Failed to load user preferences")
      setUserPreferences({ ...defaultPreferences, userId })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle general preference change
  const handleGeneralPreferenceChange = (
    key: keyof Pick<
      NotificationPreferences,
      "emailNotifications" | "browserNotifications"
    >,
    value: boolean
  ) => {
    if (!userPreferences) return

    setUserPreferences({
      ...userPreferences,
      [key]: value,
    })
  }

  // Handle notification type change
  const handleNotificationTypeChange = (
    type: keyof NotificationPreferences["notificationTypes"],
    enabled: boolean
  ) => {
    if (!userPreferences) return

    setUserPreferences({
      ...userPreferences,
      notificationTypes: {
        ...userPreferences.notificationTypes,
        [type]: enabled,
      },
    })
  }

  // Handle quiet hours change
  const handleQuietHoursChange = (
    key: keyof NotificationPreferences["quietHours"],
    value: boolean | string
  ) => {
    if (!userPreferences) return

    setUserPreferences({
      ...userPreferences,
      quietHours: {
        ...userPreferences.quietHours,
        [key]: value,
      },
    })
  }

  // Handle save button click
  const handleSave = async () => {
    if (!selectedUser || !userPreferences) {
      toast.error("Please select a user first")
      return
    }

    try {
      setSaving(true)

      // Save user preferences
      await saveNotification({
        userId: selectedUser.userId,
        companyId: 0, // You may need to get this from context or props
        type: "general_alert",
        title: "Notification Preferences Updated",
        body: `Notification preferences have been updated for user ${selectedUser.userName}`,
        data: userPreferences as unknown as Record<string, unknown>,
      })

      toast.success("User notification preferences saved successfully")
    } catch (error) {
      console.error("Error saving user notification preferences:", error)
      toast.error("Failed to save user notification preferences")
    } finally {
      setSaving(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!selectedUser) {
      setUserPreferences(null)
      toast.warning("Please select a user first")
      return
    }
    await loadUserPreferences(selectedUser.userId)
  }

  // Check if all notification types are selected
  const areAllNotificationTypesSelected = () => {
    if (!userPreferences) return false
    return Object.values(userPreferences.notificationTypes).every(Boolean)
  }

  // Handle select all notification types
  const handleSelectAllNotificationTypes = (checked: boolean) => {
    if (!userPreferences) return

    setUserPreferences({
      ...userPreferences,
      notificationTypes: {
        documentExpiry: checked,
        taskReminders: checked,
        systemUpdates: checked,
        invoiceAlerts: checked,
        paymentReminders: checked,
        generalAlerts: checked,
      },
    })
  }

  return (
    <div className="rounded-md border bg-[#10131c] p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-end gap-4">
              <div className="w-64">
                <UserAutocomplete
                  form={form}
                  name="userId"
                  label="User"
                  onChangeEvent={(user: IUserLookup | null) =>
                    setSelectedUser(user)
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedUser || !userPreferences}
              size="sm"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>

          {selectedUser && userPreferences && (
            <div className="space-y-6">
              {/* General Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>General Preferences</CardTitle>
                  <CardDescription>
                    Choose how the user wants to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={userPreferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleGeneralPreferenceChange(
                          "emailNotifications",
                          checked
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="browser-notifications">
                        Browser Notifications
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        Show notifications in the browser
                      </p>
                    </div>
                    <Switch
                      id="browser-notifications"
                      checked={userPreferences.browserNotifications}
                      onCheckedChange={(checked) =>
                        handleGeneralPreferenceChange(
                          "browserNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Types</CardTitle>
                  <CardDescription>
                    Choose which types of notifications the user wants to
                    receive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <Label>Select All Notification Types</Label>
                    <Checkbox
                      checked={areAllNotificationTypesSelected()}
                      onCheckedChange={handleSelectAllNotificationTypes}
                    />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(userPreferences.notificationTypes).map(
                      ([type, enabled]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <Label
                              htmlFor={`notification-${type}`}
                              className="capitalize"
                            >
                              {type.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                            <p className="text-muted-foreground text-xs">
                              {getNotificationTypeDescription(
                                type as keyof typeof userPreferences.notificationTypes
                              )}
                            </p>
                          </div>
                          <Checkbox
                            id={`notification-${type}`}
                            checked={enabled}
                            onCheckedChange={(checked) =>
                              handleNotificationTypeChange(
                                type as keyof typeof userPreferences.notificationTypes,
                                Boolean(checked)
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quiet Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Quiet Hours</CardTitle>
                  <CardDescription>
                    Set times when the user doesn&apos;t want to receive
                    notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="quiet-hours-enabled">
                        Enable Quiet Hours
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        Pause notifications during specific hours
                      </p>
                    </div>
                    <Switch
                      id="quiet-hours-enabled"
                      checked={userPreferences.quietHours.enabled}
                      onCheckedChange={(checked) =>
                        handleQuietHoursChange("enabled", checked)
                      }
                    />
                  </div>

                  {userPreferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={userPreferences.quietHours.startTime}
                          onChange={(e) =>
                            handleQuietHoursChange("startTime", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={userPreferences.quietHours.endTime}
                          onChange={(e) =>
                            handleQuietHoursChange("endTime", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {selectedUser && !userPreferences && !isLoading && (
            <div className="text-muted-foreground py-8 text-center">
              No notification preferences found for this user. Default
              preferences will be used.
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}

function getNotificationTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    documentExpiry: "Alerts when documents are about to expire",
    taskReminders: "Reminders for pending tasks and deadlines",
    systemUpdates: "Important system updates and maintenance",
    invoiceAlerts: "Invoice-related notifications and alerts",
    paymentReminders: "Payment due reminders and confirmations",
    generalAlerts: "General system notifications and announcements",
  }
  return descriptions[type] || "General notification"
}
