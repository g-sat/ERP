"use client"

import { IEmployerDetails } from "@/interfaces/employer-details"
import {
  EmployerDetailsFormValues,
  employerdetailsschema,
} from "@/schemas/employer-details"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
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
      bankAccountNumber: employerDetails?.bankAccountNumber || "",
      iban: employerDetails?.iban || "",
      isActive: employerDetails?.isActive ?? true,
      remarks: employerDetails?.remarks || "",
      bankName: employerDetails?.bankName || "",
      branch: employerDetails?.branch || "",
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
          <CustomInput form={form} name="branch" label="Branch" />
          <CustomInput form={form} name="bankName" label="Bank Name" />
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
