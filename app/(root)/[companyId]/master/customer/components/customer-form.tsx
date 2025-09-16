"use client"

import { useEffect } from "react"
import { ICustomer } from "@/interfaces/customer"
import { customerSchema } from "@/schemas/customer"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/ui/form"
import AccountSetAutocomplete from "@/components/ui-custom/autocomplete-accountsetup"
import BankAutocomplete from "@/components/ui-custom/autocomplete-bank"
import CreditTermAutocomplete from "@/components/ui-custom/autocomplete-creditterm"
import CurrencyAutocomplete from "@/components/ui-custom/autocomplete-currency"
import {
  default as CustomerAutocomplete,
  default as SupplierAutocomplete,
} from "@/components/ui-custom/autocomplete-customer"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface CustomerFormProps {
  initialData?: ICustomer | null
  onSave: (customer: ICustomer) => void
  onCustomerLookup?: (customerCode: string, customerName: string) => void
}

export default function CustomerForm({
  initialData,
  onSave,
  onCustomerLookup,
}: CustomerFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues:
      initialData ||
      ({
        customerId: 0,
        companyId: 0,
        customerCode: "",
        customerName: "",
        customerOtherName: "",
        customerShortName: "",
        customerRegNo: "",
        currencyId: 0,
        bankId: 0,
        creditTermId: 0,
        parentCustomerId: 0,
        accSetupId: 0,
        supplierId: 0,
        isCustomer: true,
        isVendor: false,
        isTrader: false,
        isSupplier: false,
        remarks: "",
        isActive: true,
      } as z.infer<typeof customerSchema>),
  })

  // Remove the watch effect since we'll use onBlurEvent instead
  useEffect(() => {
    form.reset(
      initialData || {
        customerId: 0,
        customerCode: "",
        customerName: "",
        customerOtherName: "",
        customerShortName: "",
        customerRegNo: "",
        currencyId: 0,
        bankId: 0,
        creditTermId: 0,
        parentCustomerId: 0,
        accSetupId: 0,
        supplierId: 0,
        isCustomer: true,
        isVendor: false,
        isTrader: false,
        isSupplier: false,
        remarks: "",
        isActive: true,
      }
    )
  }, [initialData, form])

  const onSubmit = (data: z.infer<typeof customerSchema>) => {
    // Convert string values to numbers for numeric fields
    const processedData = {
      ...data,
      customerId: Number(data.customerId),
      currencyId: Number(data.currencyId),
      bankId: Number(data.bankId),
      creditTermId: Number(data.creditTermId),
      parentCustomerId: Number(data.parentCustomerId),
      accSetupId: Number(data.accSetupId),
      supplierId: Number(data.supplierId),
    }
    console.log("processedData :", processedData)
    onSave(processedData as ICustomer)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <CustomInput
                form={form}
                name="customerCode"
                label="Customer Code"
                isRequired
                onBlurEvent={() => {
                  const customerCode = form.getValues("customerCode")
                  if (customerCode && onCustomerLookup) {
                    onCustomerLookup(customerCode, "0")
                  }
                }}
              />
              <CustomInput
                form={form}
                name="customerName"
                label="Customer Name"
                isRequired
                onBlurEvent={() => {
                  const customerName = form.getValues("customerName")
                  if (customerName && onCustomerLookup) {
                    onCustomerLookup("0", customerName)
                  }
                }}
              />

              <CustomInput
                form={form}
                name="customerOtherName"
                label="Other Name"
              />
              <CustomInput
                form={form}
                name="customerShortName"
                label="Short Name"
              />

              <CustomInput
                form={form}
                name="customerRegNo"
                label="Registration No"
              />
              <BankAutocomplete
                form={form}
                name="bankId"
                label="Bank"
                isRequired={true}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {/* Currency */}
              <CurrencyAutocomplete
                form={form}
                name="currencyId"
                label="Currency"
                isRequired={true}
              />

              <CreditTermAutocomplete
                form={form}
                name="creditTermId"
                label="Credit Term"
                onChangeEvent={(selectedCreditTerm) => {
                  // Handle the selected credit term
                  console.log("selectedCreditTerm : ", selectedCreditTerm)
                }}
                isRequired={true}
              />
              <CustomerAutocomplete
                form={form}
                name="parentCustomerId"
                label="Parent Customer"
              />

              <AccountSetAutocomplete
                form={form}
                name="accSetupId"
                label="Account Setup"
                isRequired={true}
              />

              <SupplierAutocomplete
                form={form}
                name="customerId"
                label="Supplier"
              />
            </div>

            <div className="grid grid-cols-6 gap-2">
              <CustomSwitch
                form={form}
                name="isCustomer"
                label="Is Customer"
                activeColor="success"
              />
              <CustomSwitch
                form={form}
                name="isVendor"
                label="Is Vendor"
                activeColor="success"
              />

              <CustomSwitch
                form={form}
                name="isTrader"
                label="Is Trader"
                activeColor="success"
              />
              <CustomSwitch
                form={form}
                name="isSupplier"
                label="Is Supplier"
                activeColor="success"
              />
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
              />
              <CustomTextarea form={form} name="remarks" label="Remarks" />
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
            id="customer-form-submit"
            className="hidden"
            aria-hidden="true"
          />
        </form>
      </Form>
    </div>
  )
}
