"use client"

import React from "react"
import { IEmployeePersonalDetails } from "@/interfaces/employee"
import {
  EmployeePersonalDetailsValues,
  employeePersonalDetailsSchema,
} from "@/schemas/employee"
import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInYears, format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { useSaveEmployeePersonalDetails } from "@/hooks/use-employee"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface Props {
  employee?: IEmployeePersonalDetails
  onCancel?: () => void
}

export function EmployeePersonalForm({ employee, onCancel }: Props) {
  const saveMutation = useSaveEmployeePersonalDetails()

  // Debug logging
  console.log("Employee data in personal dialog:", employee)

  const form = useForm<EmployeePersonalDetailsValues>({
    resolver: zodResolver(employeePersonalDetailsSchema),
    defaultValues: {
      employeeId: employee?.employeeId || 0,
      dateOfBirth: employee?.dateOfBirth
        ? format(
            parseDate(employee?.dateOfBirth as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      fatherName: employee?.fatherName || "",
      age: employee?.age || 0,
      permanentAddress: employee?.permanentAddress || "",
      currentAddress: employee?.currentAddress || "",
      molId: employee?.molId || "",
      emailAdd: employee?.emailAdd || "",
    },
  })

  // Calculate age when date of birth changes
  const handleDateOfBirthChange = (date: Date | null) => {
    if (date) {
      const age = differenceInYears(new Date(), date)
      form.setValue("age", age)
    }
  }

  // Reset form when employee data changes and calculate age
  React.useEffect(() => {
    if (employee) {
      const birthDate = employee.dateOfBirth
        ? parseDate(employee.dateOfBirth as string)
        : null
      const calculatedAge = birthDate
        ? differenceInYears(new Date(), birthDate)
        : 0

      form.reset({
        employeeId: employee.employeeId || 0,
        dateOfBirth: employee.dateOfBirth
          ? format(
              parseDate(employee?.dateOfBirth as string) || new Date(),
              clientDateFormat
            )
          : "",
        fatherName: employee.fatherName || "",
        age: calculatedAge,
        permanentAddress: employee.permanentAddress || "",
        currentAddress: employee.currentAddress || "",
        molId: employee.molId || "",
        emailAdd: employee.emailAdd || "",
      })
    }
  }, [employee, form])

  // Calculate age when form opens with existing date of birth
  React.useEffect(() => {
    const currentDateOfBirth = form.getValues("dateOfBirth")
    if (currentDateOfBirth && typeof currentDateOfBirth === "string") {
      const birthDate = parseDate(currentDateOfBirth)
      if (birthDate) {
        const age = differenceInYears(new Date(), birthDate)
        form.setValue("age", age)
      }
    }
  }, [form])

  const onSubmit = (data: EmployeePersonalDetailsValues) => {
    saveMutation.mutate(data)
    form.reset()
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <CustomDateNew
            form={form}
            label="Date of Birth"
            name="dateOfBirth"
            isRequired
            onChangeEvent={handleDateOfBirthChange}
          />
          <CustomInput form={form} type="number" label="Age" name="age" />

          <CustomInput form={form} label="Father's Name" name="fatherName" />

          <CustomInput form={form} label="MOL ID" name="molId" />
          <CustomInput
            form={form}
            label="Personal Email Address"
            name="emailAdd"
          />
        </div>

        <CustomTextarea
          form={form}
          label="Present Residential Address"
          name="currentAddress"
        />

        <CustomTextarea
          form={form}
          label="Permanent Address"
          name="permanentAddress"
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
