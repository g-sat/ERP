"use client"

import { useState } from "react"
import { IUser } from "@/interfaces/admin"
import { UserFormValues, userSchema } from "@/schemas/admin"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Key } from "lucide-react"
import { FieldErrors, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import UserGroupAutocomplete from "@/components/ui-custom/autocomplete-usergroup"
import UserRoleAutocomplete from "@/components/ui-custom/autocomplete-userrole"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

import { ResetPassword } from "./reset-password"

interface UserFormProps {
  initialData?: IUser
  submitAction: (data: UserFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export function UserForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: UserFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          userId: 0,
          userName: "",
          userCode: "",
          userEmail: "",
          userGroupId: 0,
          userRoleId: 0,
          isActive: true,
          isLocked: false,
          remarks: "",
        },
  })

  const onSubmit = (data: UserFormValues) => {
    try {
      submitAction(data)
    } catch {
      toast.error("Failed to submit form. Please check all required fields.")
    }
  }

  const onError = (errors: FieldErrors<UserFormValues>) => {
    const errorMessages = Object.values(errors)
      .filter((error) => error.message)
      .map((error) => error.message as string)
    toast.error(errorMessages.join("\n"))
  }

  const handleCancelReset = () => {
    setIsResetPasswordOpen(false)
  }

  const handleResetSuccess = () => {
    setIsResetPasswordOpen(false)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          <fieldset className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <CustomInput
                  form={form}
                  name="userName"
                  label="Username"
                  isRequired
                  isDisabled={isReadOnly}
                />
              </div>
              <div>
                <CustomInput
                  form={form}
                  name="userCode"
                  label="User Code"
                  isRequired
                  isDisabled={isReadOnly}
                />
              </div>
              <div>
                <CustomInput
                  form={form}
                  name="userEmail"
                  label="Email"
                  type="email"
                  isRequired
                  isDisabled={isReadOnly}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <UserGroupAutocomplete
                  form={form}
                  name="userGroupId"
                  label="Group"
                  isRequired={true}
                />
              </div>
              <div>
                <UserRoleAutocomplete
                  form={form}
                  name="userRoleId"
                  label="Role"
                  isRequired={true}
                />
              </div>
            </div>

            <div>
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <CustomSwitch
                  form={form}
                  name="isActive"
                  label="Active Status"
                  activeColor="success"
                  isDisabled={isReadOnly}
                />
              </div>
              <div>
                <CustomSwitch
                  form={form}
                  name="isLocked"
                  label="Lock Status"
                  activeColor="success"
                  isDisabled={isReadOnly}
                />
              </div>
            </div>

            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <CustomAccordion
                  type="single"
                  collapsible
                  className="rounded-md border"
                >
                  <CustomAccordionItem value="audit-info">
                    <CustomAccordionTrigger className="px-4">
                      Audit Information
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className="px-2">
                      <div className="grid grid-cols-2 gap-4">
                        {initialData.createDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Created By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.createBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {initialData.editBy && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Last Edited By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.editBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </CustomAccordion>
              )}
          </fieldset>
          <div className="flex justify-end gap-2">
            {initialData && !isReadOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetPasswordOpen(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Reset Password
              </Button>
            )}
            <Button variant="outline" type="button" onClick={onCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update User"
                    : "Create User"}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for user: {initialData?.userName}
            </DialogDescription>
          </DialogHeader>
          {initialData && (
            <ResetPassword
              userId={initialData.userId}
              userCode={initialData.userCode}
              onCancel={handleCancelReset}
              onSuccess={handleResetSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
