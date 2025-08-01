"use client"

import { useEffect } from "react"
import { IChartofAccount } from "@/interfaces/chartofaccount"
import {
  ChartofAccountFormValues,
  chartofAccountSchema,
} from "@/schemas/chartofaccount"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import AccountGroupAutocomplete from "@/components/ui-custom/autocomplete-accountgroup"
import AccountTypeAutocomplete from "@/components/ui-custom/autocomplete-accounttype"
import COACategory1Autocomplete from "@/components/ui-custom/autocomplete-coacategory1"
import COACategory2Autocomplete from "@/components/ui-custom/autocomplete-coacategory2"
import COACategory3Autocomplete from "@/components/ui-custom/autocomplete-coacategory3"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface ChartOfAccountFormProps {
  initialData?: IChartofAccount | null
  submitAction: (data: ChartofAccountFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function ChartOfAccountForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
}: ChartOfAccountFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<ChartofAccountFormValues>({
    resolver: zodResolver(chartofAccountSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          glId: 0,
          glCode: "",
          glName: "",
          accTypeId: 0,
          accGroupId: 0,
          coaCategoryId1: 0,
          coaCategoryId2: 0,
          coaCategoryId3: 0,
          isSysControl: false,
          isDeptMandatory: false,
          isBargeMandatory: false,
          isBankControl: false,
          isJobControl: false,
          seqNo: 0,
          remarks: "",
          isActive: true,
        },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    } else {
      form.reset({
        glId: 0,
        glCode: "",
        glName: "",
        accTypeId: 0,
        accGroupId: 0,
        coaCategoryId1: 0,
        coaCategoryId2: 0,
        coaCategoryId3: 0,
        isSysControl: false,
        isDeptMandatory: false,
        isBargeMandatory: false,
        isBankControl: false,
        isJobControl: false,
        seqNo: 0,
        remarks: "",
        isActive: true,
      })
    }
  }, [initialData, form])

  const handleCodeBlur = () => {
    const code = form.getValues("glCode")
    onCodeBlur?.(code)
  }

  const onSubmit = (data: ChartofAccountFormValues) => {
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
                name="glCode"
                label="GL Code"
                isRequired
                isDisabled={isReadOnly || Boolean(initialData)}
                onBlurEvent={handleCodeBlur}
              />
              <CustomInput
                form={form}
                name="glName"
                label="GL Name"
                isRequired
                isDisabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CustomInput
                form={form}
                name="seqNo"
                label="Sequence Number"
                type="number"
                isRequired
                isDisabled={isReadOnly}
              />{" "}
              <AccountTypeAutocomplete
                form={form}
                name="accTypeId"
                label="Account Type"
                isRequired={true}
                isDisabled={isReadOnly}
              />
              <AccountGroupAutocomplete
                form={form}
                name="accGroupId"
                label="Account Group"
                isRequired={true}
                isDisabled={isReadOnly}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {" "}
              <COACategory1Autocomplete
                form={form}
                name="coaCategoryId1"
                label="Category 1"
                isRequired={true}
                isDisabled={isReadOnly}
              />
              <COACategory2Autocomplete
                form={form}
                name="coaCategoryId2"
                label="Category 2"
                isRequired={true}
                isDisabled={isReadOnly}
              />
              <COACategory3Autocomplete
                form={form}
                name="coaCategoryId3"
                label="Category 3"
                isRequired={true}
                isDisabled={isReadOnly}
              />
            </div>
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isReadOnly}
            />
            <div className="grid grid-cols-5 gap-2">
              <CustomSwitch
                form={form}
                name="isSysControl"
                label="System Control"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isJobControl"
                label="Job Control"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
              <CustomSwitch
                form={form}
                name="isBankControl"
                label="Bank Control"
                activeColor="success"
                isDisabled={isReadOnly}
              />
              <CustomSwitch
                form={form}
                name="isDeptMandatory"
                label="Dep. Mandatory"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
              <CustomSwitch
                form={form}
                name="isBargeMandatory"
                label="Barge Mandatory"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
            </div>
            <CustomSwitch
              form={form}
              name="isActive"
              label="Active Status"
              activeColor="success"
              isDisabled={isReadOnly}
            />{" "}
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
                    ? "Update Chart of Account"
                    : "Create Chart of Account"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
