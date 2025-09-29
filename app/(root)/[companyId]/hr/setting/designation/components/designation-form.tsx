"use client"

import { IDesignation } from "@/interfaces/designation"
import { DesignationSchemaType, designationSchema } from "@/schemas/designation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface DesignationFormProps {
  designation?: IDesignation
  onSave: (data: DesignationSchemaType) => void
}

export function DesignationForm({ designation, onSave }: DesignationFormProps) {
  const form = useForm<DesignationSchemaType>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      designationId: designation?.designationId || 0,
      designationCode: designation?.designationCode || "",
      designationName: designation?.designationName || "",
      remarks: designation?.remarks || "",
    },
  })

  const onSubmit = (data: DesignationSchemaType) => {
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
