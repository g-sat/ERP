"use client"

import { IDepartment } from "@/interfaces/department"
import { DepartmentFormValues, departmentSchema } from "@/schemas/department"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface DepartmentFormProps {
  department?: IDepartment
  onSave: (data: DepartmentFormValues) => void
}

export function DepartmentForm({ department, onSave }: DepartmentFormProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      departmentId: department?.departmentId || 0,
      departmentCode: department?.departmentCode || "",
      departmentName: department?.departmentName || "",
      remarks: department?.remarks || "",
    },
  })

  const onSubmit = (data: DepartmentFormValues) => {
    onSave(data)
  }

  return (
    <Form {...form}>
      <form
        id="department-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <CustomInput
          form={form}
          isRequired={true}
          name="departmentCode"
          label="Department Code"
        />

        <CustomInput
          form={form}
          isRequired={true}
          name="departmentName"
          label="Department Name"
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
