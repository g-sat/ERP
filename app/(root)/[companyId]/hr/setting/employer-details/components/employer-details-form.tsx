"use client"

import { IEmployerDetails } from "@/interfaces/employer-details"
import {
  EmployerDetailsFormValues,
  employerdetailsschema,
} from "@/schemas/employer-details"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Form } from "@/components/ui/form"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface EmployerDetailsFormProps {
  employerDetails?: IEmployerDetails
  onSave: (data: EmployerDetailsFormValues) => void
}

export function EmployerDetailsForm({
  employerDetails,
  onSave,
}: EmployerDetailsFormProps) {
  const form = useForm<EmployerDetailsFormValues>({
    resolver: zodResolver(employerdetailsschema),
    defaultValues: {
      employerDetailsId: employerDetails?.employerDetailsId || 0,
      companyId: employerDetails?.companyId || 0,
      establishmentId: employerDetails?.establishmentId || "",
      establishmentCardExpiry: employerDetails?.establishmentCardExpiry
        ? format(
            parseDate(employerDetails?.establishmentCardExpiry as string) ||
              new Date(),
            clientDateFormat
          )
        : "",
      employerRefno: employerDetails?.employerRefno || "",
      wpsBankCode: employerDetails?.wpsBankCode || "",
      wpsFileReference: employerDetails?.wpsFileReference || "",
      bankAccountNumber: employerDetails?.bankAccountNumber || "",
      iban: employerDetails?.iban || "",
      isActive: employerDetails?.isActive ?? true,
      remarks: employerDetails?.remarks || "",
    },
  })

  const onSubmit = (data: EmployerDetailsFormValues) => {
    onSave(data)
  }

  return (
    <Form {...form}>
      <form
        id="employerDetails-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <CompanyAutocomplete
          form={form}
          name="companyId"
          label="Company"
          isRequired={true}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomInput
            form={form}
            name="establishmentId"
            label="Establishment ID"
            isRequired={true}
          />

          <CustomDateNew
            form={form}
            name="establishmentCardExpiry"
            label="Establishment Card Expiry"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomInput
            form={form}
            name="employerRefno"
            label="Employer Ref No"
          />

          <CustomInput form={form} name="wpsBankCode" label="WPS Bank Code" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomInput
            form={form}
            name="wpsFileReference"
            label="WPS File Reference"
          />

          <CustomInput
            form={form}
            name="bankAccountNumber"
            label="Bank Account Number"
          />
        </div>

        <CustomInput form={form} name="iban" label="IBAN" />

        <CustomTextarea form={form} name="remarks" label="Remarks" />
      </form>
    </Form>
  )
}
