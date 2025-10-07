"use client"

import { useEffect } from "react"
import { IVoyage } from "@/interfaces/voyage"
import { VoyageSchemaType, voyageSchema } from "@/schemas/voyage"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import BargeAutocomplete from "@/components/autocomplete/autocomplete-barge"
import VesselAutocomplete from "@/components/autocomplete/autocomplete-vessel"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

interface VoyageFormProps {
  initialData?: IVoyage | null
  submitAction: (data: VoyageSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function VoyageForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
}: VoyageFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const defaultValues = {
    voyageId: 0,
    voyageNo: "",
    referenceNo: "",
    vesselId: 0,
    bargeId: 0,
    remarks: "",
    isActive: true,
  }

  const form = useForm<VoyageSchemaType>({
    resolver: zodResolver(voyageSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
          voyageId: initialData.voyageId ?? 0,
          voyageNo: initialData.voyageNo ?? "",
          referenceNo: initialData.referenceNo ?? "",
          vesselId: initialData.vesselId ?? 0,
          bargeId: initialData.bargeId ?? 0,
          remarks: initialData.remarks ?? "",
          isActive: initialData.isActive ?? true,
        }
      : {
          ...defaultValues,
        },
  })

  useEffect(() => {
    form.reset(
      initialData
        ? {
            voyageId: initialData.voyageId ?? 0,
            voyageNo: initialData.voyageNo ?? "",
            referenceNo: initialData.referenceNo ?? "",
            vesselId: initialData.vesselId ?? 0,
            bargeId: initialData.bargeId ?? 0,
            remarks: initialData.remarks ?? "",
            isActive: initialData.isActive ?? true,
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form, defaultValues])

  const handleCodeBlur = () => {
    const code = form.getValues("voyageNo")
    onCodeBlur?.(code)
  }

  const onSubmit = (data: VoyageSchemaType) => {
    console.log("onSubmit :", data)
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <CustomInput
                form={form}
                name="voyageNo"
                label="Voyage No"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />
              <CustomInput
                form={form}
                name="referenceNo"
                label="Reference No"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <VesselAutocomplete
                form={form}
                name="vesselId"
                label="Vessel"
                isDisabled={isReadOnly}
                isRequired
              />
              <BargeAutocomplete
                form={form}
                name="bargeId"
                label="Barge"
                isDisabled={isReadOnly}
                isRequired
              />
            </div>

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
                    ? "Update Voyage"
                    : "Create Voyage"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
