"use client"

import { useEffect } from "react"
import { ICharge } from "@/interfaces/charge"
import { ChargeSchemaType, chargeSchema } from "@/schemas/charge"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ChartofAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import TaskAutocomplete from "@/components/autocomplete/autocomplete-task"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

const defaultValues = {
  chargeId: 0,
  chargeName: "",
  chargeCode: "",
  taskId: 0,
  chargeOrder: 0,
  itemNo: 0,
  glId: 0,
  remarks: "",
  isActive: true,
}
interface ChargeFormProps {
  initialData?: ICharge
  submitAction: (data: ChargeSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string, taskId?: number) => void
  companyId: string
}

export function ChargeForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
  companyId,
}: ChargeFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Get chart of account data to ensure it's loaded before setting form values
  useChartofAccountLookup(Number(companyId))

  const form = useForm<ChargeSchemaType>({
    resolver: zodResolver(chargeSchema),
    defaultValues: initialData
      ? {
          chargeId: initialData.chargeId ?? 0,
          chargeName: initialData.chargeName ?? "",
          chargeCode: initialData.chargeCode ?? "",
          taskId: initialData.taskId ?? 0,
          chargeOrder: initialData.chargeOrder ?? 0,
          itemNo: initialData.itemNo ?? 0,
          glId: initialData.glId ?? 0,
          remarks: initialData.remarks ?? "",
          isActive: initialData.isActive ?? true,
        }
      : {
          ...defaultValues,
        },
  })

  // Reset form when initialData changes
  useEffect(() => {
    form.reset(
      initialData
        ? {
            chargeId: initialData.chargeId ?? 0,
            chargeName: initialData.chargeName ?? "",
            chargeCode: initialData.chargeCode ?? "",
            taskId: initialData.taskId ?? 0,
            chargeOrder: initialData.chargeOrder ?? 0,
            itemNo: initialData.itemNo ?? 0,
            glId: initialData.glId ?? 0,
            remarks: initialData.remarks ?? "",
            isActive: initialData.isActive ?? true,
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form])

  const handleCodeBlur = () => {
    const code = form.getValues("chargeCode")
    const taskId = form.getValues("taskId")
    onCodeBlur?.(code, taskId)
  }

  const handleTaskChange = () => {
    const code = form.getValues("chargeCode")
    const taskId = form.getValues("taskId")
    // Only check if both code and taskId are available
    if (code && taskId && taskId > 0) {
      onCodeBlur?.(code, taskId)
    }
  }

  const onSubmit = (data: ChargeSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <TaskAutocomplete
                form={form}
                name="taskId"
                label="Task"
                isRequired={true}
                onChangeEvent={handleTaskChange}
              />
              <CustomInput
                form={form}
                name="chargeCode"
                label="Charge Code"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />
              <CustomInput
                form={form}
                name="chargeName"
                label="Charge Name"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="chargeOrder"
                label="Charge Order"
                type="number"
                isDisabled={isReadOnly}
              />
              <CustomInput
                form={form}
                name="itemNo"
                label="Item No"
                type="number"
                isDisabled={isReadOnly}
              />
              <ChartofAccountAutocomplete
                form={form}
                name="glId"
                label="Account"
                isRequired={true}
                companyId={Number(companyId)}
              />
            </div>

            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />
            <div className="grid grid-cols-2 gap-2">
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
                isDisabled={isReadOnly}
              />
            </div>

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-2">
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
                                  : "-"}
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
            <Button variant="outline" type="button" onClick={onCancelAction}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Charge"
                    : "Create Charge"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
