"use client"

import { useEffect } from "react"
import { ICreditTerm } from "@/interfaces/creditterm"
import { CreditTermFormValues, credittermSchema } from "@/schemas/creditterm"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface CreditTermFormProps {
  initialData?: ICreditTerm | null
  submitAction: (data: CreditTermFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function CreditTermForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
}: CreditTermFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm<CreditTermFormValues>({
    resolver: zodResolver(credittermSchema),
    defaultValues: {
      creditTermId: initialData?.creditTermId || 0,
      creditTermCode: initialData?.creditTermCode || "",
      creditTermName: initialData?.creditTermName || "",
      noDays: initialData?.noDays || 0,
      isActive: initialData?.isActive ?? true,
      remarks: initialData?.remarks || "",
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        creditTermId: initialData.creditTermId || 0,
        creditTermCode: initialData.creditTermCode || "",
        creditTermName: initialData.creditTermName || "",
        noDays: initialData.noDays || 0,
        isActive: initialData.isActive ?? true,
        remarks: initialData.remarks || "",
      })
    } else {
      form.reset({
        creditTermId: 0,
        creditTermCode: "",
        creditTermName: "",
        noDays: 0,
        isActive: true,
        remarks: "",
      })
    }
  }, [initialData, form])

  const handleCodeBlur = () => {
    const code = form.getValues("creditTermCode")
    onCodeBlur?.(code)
  }

  const onSubmit = (data: CreditTermFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="creditTermCode"
                label="Code"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />

              <CustomInput
                form={form}
                name="creditTermName"
                label="Name"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>

            <CustomInput
              form={form}
              name="noDays"
              label="Days"
              type="number"
              isRequired
              isDisabled={isReadOnly}
            />

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />

            <CustomSwitch
              form={form}
              name="isActive"
              label="Active Status"
              activeColor="success"
              isDisabled={isReadOnly}
            />

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-6">
                  <div className="border-border border-b pb-4"></div>

                  <CustomAccordion
                    type="single"
                    collapsible
                    className="border-border bg-muted/50 rounded-lg border"
                  >
                    <CustomAccordionItem
                      value="audit-info"
                      className="border-none"
                    >
                      <CustomAccordionTrigger className="hover:bg-muted rounded-lg px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">View Audit Trail</span>
                          <Badge variant="secondary" className="text-xs">
                            {initialData.createDate ? "Created" : ""}
                            {initialData.editDate ? " • Modified" : ""}
                          </Badge>
                        </div>
                      </CustomAccordionTrigger>
                      <CustomAccordionContent className="px-6 pb-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {initialData.createDate && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">
                                  Created By
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {initialData.createBy}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </div>
                            </div>
                          )}
                          {initialData.editBy && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">
                                  Last Modified By
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {initialData.editBy}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "—"}
                              </div>
                            </div>
                          )}
                        </div>
                      </CustomAccordionContent>
                    </CustomAccordionItem>
                  </CustomAccordion>
                </div>
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
                    ? "Update Credit Term"
                    : "Create Credit Term"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
