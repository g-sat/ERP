"use client"

import { useEffect } from "react"
import { ITax } from "@/interfaces/tax"
import { TaxFormValues, taxSchema } from "@/schemas/tax"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import TaxCategoryAutocomplete from "@/components/ui-custom/autocomplete-taxcategory"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface TaxFormProps {
  initialData?: ITax | null
  submitAction: (data: TaxFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function TaxForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
  onCodeBlur,
}: TaxFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  console.log("initialData TaxForm", initialData)
  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxId: initialData?.taxId || 0,
      taxCode: initialData?.taxCode || "",
      taxName: initialData?.taxName || "",
      taxCategoryId: initialData?.taxCategoryId || 0,
      isActive: initialData?.isActive || true,
      remarks: initialData?.remarks || "",
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      form.reset({
        taxId: 0,
        taxCode: "",
        taxName: "",
        taxCategoryId: 0,
        remarks: "",
        isActive: true,
      })
    }
  }, [initialData, form])

  const handleCodeBlur = () => {
    const code = form.getValues("taxCode")
    onCodeBlur?.(code)
  }

  const onSubmit = async (data: TaxFormValues) => {
    await submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <TaxCategoryAutocomplete
                form={form}
                name="taxCategoryId"
                label="Tax Category"
                isDisabled={isReadOnly || isSubmitting}
                isRequired={true}
              />

              <CustomInput
                form={form}
                name="taxCode"
                label="Tax Code"
                isRequired
                isDisabled={isReadOnly || isSubmitting}
                onBlurEvent={handleCodeBlur}
              />

              <CustomInput
                form={form}
                name="taxName"
                label="Tax Name"
                isRequired
                isDisabled={isReadOnly || isSubmitting}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly || isSubmitting}
            />
            <CustomSwitch
              form={form}
              name="isActive"
              label="Active Status"
              activeColor="success"
              isDisabled={isReadOnly || isSubmitting}
            />
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
