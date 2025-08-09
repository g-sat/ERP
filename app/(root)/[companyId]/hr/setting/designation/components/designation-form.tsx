"use client"

import { IDesignation } from "@/interfaces/designation"
import { DesignationFormValues, designationSchema } from "@/schemas/designation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface DesignationFormProps {
  designation?: IDesignation
  onSave: (data: DesignationFormValues) => void
}

export function DesignationForm({ designation, onSave }: DesignationFormProps) {
  const form = useForm<DesignationFormValues>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      designationId: designation?.designationId || 0,
      designationCode: designation?.designationCode || "",
      designationName: designation?.designationName || "",
      remarks: designation?.remarks || "",
    },
  })

  const onSubmit = (data: DesignationFormValues) => {
    onSave(data)
  }

  return (
    <Form {...form}>
      <form
        id="designation-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <CustomInput
          form={form}
          isRequired={true}
          name="designationCode"
          label="Designation Code"
        />

        <CustomInput
          form={form}
          isRequired={true}
          name="designationName"
          label="Designation Name"
        />

        <CustomTextarea
          form={form}
          isRequired={true}
          name="remarks"
          label="Remarks"
        />
      </form>
    </Form>
  )
}
