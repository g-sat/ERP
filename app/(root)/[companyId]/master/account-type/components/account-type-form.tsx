"use client"

import { useEffect } from "react"
import { IAccountType } from "@/interfaces/accounttype"
import { AccountTypeFormValues, accountTypeSchema } from "@/schemas/accounttype"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import AccountGroupAutocomplete from "@/components/ui-custom/autocomplete-accountgroup"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface AccountTypeFormProps {
  initialData?: IAccountType
  submitAction: (data: AccountTypeFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function AccountTypeForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
}: AccountTypeFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm<AccountTypeFormValues>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          accTypeId: 0,
          accTypeCode: "",
          accTypeName: "",
          seqNo: 0,
          accGroupName: "",
          isActive: true,
          remarks: "",
        },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      form.reset({
        accTypeId: 0,
        accTypeCode: "",
        accTypeName: "",
        seqNo: 0,
        accGroupName: "",
        isActive: true,
        remarks: "",
      })
    }
  }, [initialData, form])

  const handleCodeBlur = () => {
    const code = form.getValues("accTypeCode")
    onCodeBlur?.(code)
  }

  const onSubmit = (data: AccountTypeFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="accTypeCode"
                label="Account Type Code"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />
              <CustomInput
                form={form}
                name="accTypeName"
                label="Account Type Name"
                isRequired
                isDisabled={isReadOnly}
              />

              <CustomInput
                form={form}
                name="seqNo"
                label="Sequence Number"
                type="number"
                isDisabled={isReadOnly}
              />
            </div>

            <AccountGroupAutocomplete
              form={form}
              name="accGroupName"
              label="Account Group"
              isRequired
              isDisabled={isReadOnly}
            />

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />
            <div className="grid grid-cols-1 gap-2">
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
                isDisabled={isReadOnly}
              />
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
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Account Type"
                    : "Create Account Type"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
