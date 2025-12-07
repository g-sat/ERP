"use client"

import { useEffect } from "react"
import { IChargeGLMapping } from "@/interfaces/chargeglmapping"
import { IChargeLookup, IChartOfAccountLookup } from "@/interfaces/lookup"
import {
  ChargeGLMappingSchemaType,
  chargeGLMappingSchema,
} from "@/schemas/chargeglmapping"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { useChargeLookup, useChartOfAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  ChargeAutocomplete,
  ChartOfAccountAutocomplete,
} from "@/components/autocomplete"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomSwitch from "@/components/custom/custom-switch"

const defaultValues = {
  chargeId: 0,
  glId: 0,
  isActive: true,
}

interface ChargeGLMappingFormProps {
  initialData?: IChargeGLMapping
  submitAction: (data: ChargeGLMappingSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  companyId: string
}

export function ChargeGLMappingForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  companyId,
}: ChargeGLMappingFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Fetch lookup data for populating code/name fields
  const { data: charges, refetch: refetchCharges } = useChargeLookup(0)
  const { data: chartOfAccounts } = useChartOfAccountLookup(Number(companyId))

  // Ensure charges are loaded when form opens (refetch on mount)
  useEffect(() => {
    refetchCharges()
  }, [refetchCharges])

  const form = useForm<ChargeGLMappingSchemaType>({
    resolver: zodResolver(chargeGLMappingSchema),
    defaultValues: initialData
      ? {
          chargeId: initialData.chargeId ?? 0,
          glId: initialData.glId ?? 0,
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
            glId: initialData.glId ?? 0,
            isActive: initialData.isActive ?? true,
          }
        : {
            ...defaultValues,
          }
    )
  }, [initialData, form])

  // Function to populate code/name fields from lookup data
  const populateData = (
    formData: ChargeGLMappingSchemaType
  ): ChargeGLMappingSchemaType & {
    chargeName?: string
    glCode?: string
    glName?: string
  } => {
    const populatedData = {
      ...formData,
      chargeName: "",
      glCode: "",
      glName: "",
    }

    // Populate charge name if chargeId is set
    if (populatedData.chargeId && populatedData.chargeId > 0) {
      const chargeData = charges?.find(
        (charge: IChargeLookup) => charge.chargeId === populatedData.chargeId
      )
      if (chargeData) {
        populatedData.chargeName = chargeData.chargeName || ""
      }
    }

    // Populate GL code/name if glId is set
    if (populatedData.glId && populatedData.glId > 0) {
      const glData = chartOfAccounts?.find(
        (gl: IChartOfAccountLookup) => gl.glId === populatedData.glId
      )
      if (glData) {
        populatedData.glCode = glData.glCode || ""
        populatedData.glName = glData.glName || ""
      }
    }

    return populatedData
  }

  const onSubmit = (data: ChargeGLMappingSchemaType) => {
    const populatedData = populateData(data)
    // Submit with populated data (chargeName, glCode, glName will be included)
    // The submitAction accepts the base schema type, but backend may use the additional fields
    submitAction(populatedData as ChargeGLMappingSchemaType)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={0 as number}
                isRequired={true}
                isDisabled={isReadOnly}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isReadOnly}
                companyId={Number(companyId)}
              />
            </div>

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
                    ? "Update Charge GL Mapping"
                    : "Create Charge GL Mapping"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
