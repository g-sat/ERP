"use client"

import { useEffect } from "react"
import { IBank } from "@/interfaces/bank"
import { bankSchema } from "@/schemas/bank"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/ui/form"
import ChartofAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

interface BankFormProps {
  initialData?: IBank | null
  onSave: (bank: IBank) => void
  onBankLookup?: (bankCode: string, bankName: string) => void
}

export default function BankForm({
  initialData,
  onSave,
  onBankLookup,
}: BankFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues:
      initialData ||
      ({
        bankId: 0,
        companyId: 0,
        bankCode: "",
        bankName: "",
        currencyId: 0,
        accountNo: "",
        swiftCode: "",
        remarks1: "",
        remarks2: "",
        remarks3: "",
        glId: 0,
        isOwnBank: false,
        isPettyCashBank: false,
        remarks: "",
        isActive: true,
      } as z.infer<typeof bankSchema>),
  })

  // Remove the watch effect since we'll use onBlurEvent instead
  useEffect(() => {
    form.reset(
      initialData || {
        bankId: 0,
        bankCode: "",
        bankName: "",
        currencyId: 0,
        accountNo: "",
        swiftCode: "",
        remarks1: "",
        remarks2: "",
        remarks3: "",
        glId: 0,
        isOwnBank: false,
        isPettyCashBank: false,
        remarks: "",
        isActive: true,
      }
    )
  }, [initialData, form, defaultValues])

  const onSubmit = (data: z.infer<typeof bankSchema>) => {
    // Convert string values to numbers for numeric fields
    const processedData = {
      ...data,
      bankId: Number(data.bankId),
      currencyId: Number(data.currencyId),
      glId: Number(data.glId),
    }
    console.log("processedData :", processedData)
    onSave(processedData as IBank)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <CustomInput
                form={form}
                name="bankCode"
                label="Bank Code"
                isRequired
                onBlurEvent={() => {
                  const bankCode = form.getValues("bankCode")
                  if (bankCode && onBankLookup) {
                    onBankLookup(bankCode, "0")
                  }
                }}
              />
              <CustomInput
                form={form}
                name="bankName"
                label="Bank Name"
                isRequired
                onBlurEvent={() => {
                  const bankName = form.getValues("bankName")
                  if (bankName && onBankLookup) {
                    onBankLookup("0", bankName)
                  }
                }}
              />

              {/* Currency */}
              <CurrencyAutocomplete
                form={form}
                name="currencyId"
                label="Currency"
                isRequired={true}
              />
              {/* Chart of Account */}
              <ChartofAccountAutocomplete
                form={form}
                name="glId"
                label="Chart of Account"
                isRequired={true}
              />

              <CustomInput form={form} name="accountNo" label="Account No" />
              <CustomInput form={form} name="swiftCode" label="Swift Code" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CustomTextarea form={form} name="remarks1" label="Remarks 1" />
              <CustomTextarea form={form} name="remarks2" label="Remarks 2" />
              <CustomTextarea form={form} name="remarks3" label="Remarks 3" />
            </div>

            <div className="grid grid-cols-6 gap-2">
              <CustomSwitch
                form={form}
                name="isOwnBank"
                label="Is Own Bank"
                activeColor="success"
              />
              <CustomSwitch
                form={form}
                name="isPettyCashBank"
                label="Is Petty Cash Bank"
                activeColor="success"
              />

              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
              />
            </div>

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-6 pt-6">
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

          {/* Hidden submit button for external trigger */}
          <button
            type="submit"
            id="bank-form-submit"
            className="hidden"
            aria-hidden="true"
          />
        </form>
      </Form>
    </div>
  )
}
