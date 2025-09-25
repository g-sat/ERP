"use client"

import { IEmployer } from "@/interfaces/employer"
import { EmployerFormValues, employerschema } from "@/schemas/employer"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import CompanyAutocomplete from "@/components/autocomplete/autocomplete-company"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface EmployerFormProps {
  employer?: IEmployer
  onSave: (data: EmployerFormValues) => void
}

export function EmployerForm({ employer, onSave }: EmployerFormProps) {
  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerschema),
    defaultValues: {
      employerId: employer?.employerId || 0,
      companyId: employer?.companyId || 0,
      address: employer?.address || "",
      phone: employer?.phone || "",
      email: employer?.email || "",
      establishmentId: employer?.establishmentId || "",
      bankAccountNumber: employer?.bankAccountNumber || "",
      iban: employer?.iban || "",
      isActive: employer?.isActive ?? true,
      remarks: employer?.remarks || "",
      bankName: employer?.bankName || "",
      branch: employer?.branch || "",
    },
  })

  const onSubmit = (data: EmployerFormValues) => {
    onSave(data)
  }

  return (
    <Form {...form}>
      <form
        id="employer-form"
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
          <CustomInput form={form} name="address" label="Address" />
          <CustomInput form={form} name="phone" label="Phone" />
          <CustomInput form={form} name="email" label="Email" />
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
