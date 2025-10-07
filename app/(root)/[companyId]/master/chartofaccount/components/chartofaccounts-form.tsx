"use client"

import { useEffect } from "react"
import { IChartofAccount } from "@/interfaces/chartofaccount"
import {
  ChartofAccountSchemaType,
  chartofAccountSchema,
} from "@/schemas/chartofaccount"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import {
  useAccountGroupLookup,
  useAccountTypeLookup,
  useCOACategory1Lookup,
  useCOACategory2Lookup,
  useCOACategory3Lookup,
} from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import AccountGroupAutocomplete from "@/components/autocomplete/autocomplete-accountgroup"
import AccountTypeAutocomplete from "@/components/autocomplete/autocomplete-accounttype"
import COACategory1Autocomplete from "@/components/autocomplete/autocomplete-coacategory1"
import COACategory2Autocomplete from "@/components/autocomplete/autocomplete-coacategory2"
import COACategory3Autocomplete from "@/components/autocomplete/autocomplete-coacategory3"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

const defaultValues = {
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
  isBankAccount: false,
  isJobSpecific: false,
  seqNo: 0,
  remarks: "",
  isActive: true,
}
interface ChartOfAccountFormProps {
  initialData?: IChartofAccount | null
  submitAction: (data: ChartofAccountSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  onCodeBlur?: (code: string) => void
}

export function ChartOfAccountForm({
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isReadOnly = false,
  onCodeBlur,
}: ChartOfAccountFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm<ChartofAccountSchemaType>({
    resolver: zodResolver(chartofAccountSchema),
    defaultValues: initialData
      ? {
          glId: initialData.glId ?? 0,
          glCode: initialData.glCode ?? "",
          glName: initialData.glName ?? "",
          accTypeId: initialData.accTypeId ?? 0,
          accGroupId: initialData.accGroupId ?? 0,
          coaCategoryId1: initialData.coaCategoryId1 ?? 0,
          coaCategoryId2: initialData.coaCategoryId2 ?? 0,
          coaCategoryId3: initialData.coaCategoryId3 ?? 0,
          isSysControl: initialData.isSysControl ?? false,
          isDeptMandatory: initialData.isDeptMandatory ?? false,
          isBargeMandatory: initialData.isBargeMandatory ?? false,
          isBankAccount: initialData.isBankAccount ?? false,
          isJobSpecific: initialData.isJobSpecific ?? false,
          isOperational: initialData.isOperational ?? false,
          isPayableAccount: initialData.isPayableAccount ?? false,
          isReceivableAccount: initialData.isReceivableAccount ?? false,
          isUniversal: initialData.isUniversal ?? false,
          seqNo: initialData.seqNo ?? 0,
          remarks: initialData.remarks ?? "",
          isActive: initialData.isActive ?? true,
        }
      : {
          ...defaultValues,
        },
  })

  useAccountTypeLookup()
  useAccountGroupLookup()
  useCOACategory1Lookup()
  useCOACategory2Lookup()
  useCOACategory3Lookup()

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
        isBankAccount: false,
        isJobSpecific: false,
        isOperational: false,
        isPayableAccount: false,
        isReceivableAccount: false,
        isUniversal: false,
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

  const onSubmit = (data: ChartofAccountSchemaType) => {
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
                label="Seq No"
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
                isDisabled={isReadOnly}
              />
              <COACategory3Autocomplete
                form={form}
                name="coaCategoryId3"
                label="Category 3"
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
                name="isJobSpecific"
                label="Job Control"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
              <CustomSwitch
                form={form}
                name="isBankAccount"
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
              <CustomSwitch
                form={form}
                name="isOperational"
                label="Operational"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
              <CustomSwitch
                form={form}
                name="isPayableAccount"
                label="Payable Account"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
              <CustomSwitch
                form={form}
                name="isReceivableAccount"
                label="Receivable Account"
                activeColor="success"
                isDisabled={isReadOnly}
              />{" "}
              <CustomSwitch
                form={form}
                name="isUniversal"
                label="Universal"
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
