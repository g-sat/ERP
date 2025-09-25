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
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"

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
      dob: employee?.dob
        ? format(
            parseDate(employee?.dob as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      fatherName: employee?.fatherName || "",
      age: employee?.age || 0,
      permanentAddress: employee?.permanentAddress || "",
      currentAddress: employee?.currentAddress || "",
      workPermitNo: employee?.workPermitNo || "",
      personalNo: employee?.personalNo || "",
      emailAdd: employee?.emailAdd || "",
      passportNo: employee?.passportNo || "",
      passportExpiryDate: employee?.passportExpiryDate
        ? format(
            parseDate(employee?.passportExpiryDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      emiratesIdNo: employee?.emiratesIdNo || "",
      emiratesIdExpiryDate: employee?.emiratesIdExpiryDate
        ? format(
            parseDate(employee?.emiratesIdExpiryDate as string) || new Date(),
            clientDateFormat
          )
        : "",
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
      const birthDate = employee.dob ? parseDate(employee.dob as string) : null
      const calculatedAge = birthDate
        ? differenceInYears(new Date(), birthDate)
        : 0

      form.reset({
        employeeId: employee.employeeId || 0,
        dob: employee.dob
          ? format(
              parseDate(employee?.dob as string) || new Date(),
              clientDateFormat
            )
          : "",
        fatherName: employee.fatherName || "",
        age: calculatedAge,
        permanentAddress: employee.permanentAddress || "",
        currentAddress: employee.currentAddress || "",
        workPermitNo: employee.workPermitNo || "",
        personalNo: employee.personalNo || "",
        emailAdd: employee.emailAdd || "",
        passportNo: employee.passportNo || "",
        passportExpiryDate: employee.passportExpiryDate
          ? format(
              parseDate(employee?.passportExpiryDate as string) || new Date(),
              clientDateFormat
            )
          : "",
        emiratesIdNo: employee.emiratesIdNo || "",
        emiratesIdExpiryDate: employee.emiratesIdExpiryDate
          ? format(
              parseDate(employee?.emiratesIdExpiryDate as string) || new Date(),
              clientDateFormat
            )
          : "",
        emergencyContactNo: employee.emergencyContactNo || "",
        personalContactNo: employee.personalContactNo || "",
      })
    }
  }, [employee, form])

  // Calculate age when form opens with existing date of birth
  React.useEffect(() => {
    const currentDateOfBirth = form.getValues("dob")
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <CustomDateNew
            form={form}
            label="Date of Birth"
            name="dob"
            isRequired
            onChangeEvent={handleDateOfBirthChange}
          />
          <CustomInput form={form} type="number" label="Age" name="age" />

          <CustomInput form={form} label="Father's Name" name="fatherName" />

          <CustomInput form={form} label="Work Permit No" name="workPermitNo" />
          <CustomInput form={form} label="Personal No" name="personalNo" />
          <CustomInput
            form={form}
            label="Personal Email Address"
            name="emailAdd"
          />
          <CustomInput form={form} label="Passport No" name="passportNo" />
          <CustomDateNew
            form={form}
            label="Passport Expiry Date"
            name="passportExpiryDate"
          />
          <CustomInput form={form} label="Emirates ID No" name="emiratesIdNo" />
          <CustomDateNew
            form={form}
            label="Emirates ID Expiry Date"
            name="emiratesIdExpiryDate"
          />
          <CustomInput
            form={form}
            label="Emergency Contact No"
            name="emergencyContactNo"
          />
          <CustomInput
            form={form}
            label="Personal Contact No"
            name="personalContactNo"
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
