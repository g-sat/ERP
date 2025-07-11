"use client"

import { IUom } from "@/interfaces/uom"
import { UomFormValues, uomSchema } from "@/schemas/uom"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import * as z from "zod"

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

interface UomFormProps {
  initialData?: IUom | null
  submitAction: (data: z.infer<typeof uomSchema>) => void
  onCancel: () => void
  isSubmitting: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function UomForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting,
  isReadOnly = false,
  onCodeBlur,
}: UomFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<z.infer<typeof uomSchema>>({
    resolver: zodResolver(uomSchema),
    defaultValues: {
      uomId: initialData?.uomId || 0,
      uomCode: initialData?.uomCode || "",
      uomName: initialData?.uomName || "",
      remarks: initialData?.remarks || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const handleCodeBlur = () => {
    const code = form.getValues("uomCode")
    onCodeBlur?.(code)
  }

  const onSubmit = (data: UomFormValues) => {
    submitAction(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomInput
              form={form}
              name="uomCode"
              label="UOM Code"
              placeholder="Enter UOM Code"
              isRequired
              isDisabled={isReadOnly}
              onBlurEvent={handleCodeBlur}
            />

            <CustomInput
              form={form}
              name="uomName"
              label="UOM Name"
              placeholder="Enter UOM Name"
              isRequired
              isDisabled={isReadOnly}
            />
          </div>

          <CustomTextarea
            form={form}
            name="remarks"
            label="Description"
            isDisabled={isReadOnly}
          />

          <CustomSwitch
            form={form}
            name="isActive"
            label="Active Status"
            activeColor="success"
            isDisabled={isReadOnly}
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

        {!isReadOnly && (
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
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
