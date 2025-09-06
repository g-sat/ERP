"use client"

import { useEffect } from "react"
import { IJobOrderHd, IPortExpenses } from "@/interfaces/checklist"
import { PortExpensesFormValues, PortExpensesSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Task } from "@/lib/operations-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ChargeAutocomplete from "@/components/ui-custom/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import StatusTaskAutocomplete from "@/components/ui-custom/autocomplete-status-task"
import SupplierAutocomplete from "@/components/ui-custom/autocomplete-supplier"
import UomAutocomplete from "@/components/ui-custom/autocomplete-uom"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface PortExpensesFormProps {
  jobData: IJobOrderHd
  initialData?: IPortExpenses
  submitAction: (data: PortExpensesFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function PortExpensesForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: PortExpensesFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  console.log("initialData :", initialData)
  console.log("deliverDate :", initialData?.deliverDate)
  console.log("deliverDate :", parseDate(initialData?.deliverDate as string))
  console.log(
    "deliverDate :",
    format(
      parseDate(initialData?.deliverDate as string) || new Date(),
      clientDateFormat
    )
  )
  const form = useForm<PortExpensesFormValues>({
    resolver: zodResolver(PortExpensesSchema),
    defaultValues: {
      portExpenseId: initialData?.portExpenseId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      quantity: initialData?.quantity ?? 1,
      supplierId: initialData?.supplierId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
      statusId: initialData?.statusId ?? 802,
      uomId: initialData?.uomId ?? 0,
      deliverDate: initialData?.deliverDate
        ? format(
            parseDate(initialData.deliverDate as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      glId: initialData?.glId ?? 0,
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      remarks: initialData?.remarks ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      portExpenseId: initialData?.portExpenseId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      quantity: initialData?.quantity ?? 1,
      supplierId: initialData?.supplierId ?? 0,
      chargeId: initialData?.chargeId ?? 0,
      statusId: initialData?.statusId ?? 802,
      uomId: initialData?.uomId ?? 0,
      deliverDate: initialData?.deliverDate
        ? format(
            parseDate(initialData.deliverDate as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      glId: initialData?.glId ?? 0,
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      remarks: initialData?.remarks ?? "",
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  const onSubmit = (data: PortExpensesFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <SupplierAutocomplete
                form={form}
                name="supplierId"
                label="Supplier Name"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={Task.PortExpenses}
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <UomAutocomplete
                form={form}
                name="uomId"
                label="UOM"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomDateNew
                form={form}
                name="deliverDate"
                label="Deliver Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="quantity"
                label="Quantity"
                type="number"
                isRequired
                isDisabled={isConfirmed}
              />

              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
            </div>

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
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Port Expense"
                    : "Add Port Expense"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
