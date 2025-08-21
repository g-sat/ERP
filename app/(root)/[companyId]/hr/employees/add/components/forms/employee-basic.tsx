"use client"

import React from "react"
import { IEmployeeBasic } from "@/interfaces/employee"
import { EmployeeBasicValues, employeeBasicSchema } from "@/schemas/employee"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import ContractTypeAutocomplete from "@/components/ui-custom/autocomplete-contract-type"
import CountryAutocomplete from "@/components/ui-custom/autocomplete-country"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import DesignationAutocomplete from "@/components/ui-custom/autocomplete-designation"
import EmploymentTypeAutocomplete from "@/components/ui-custom/autocomplete-employment-type"
import GenderAutocomplete from "@/components/ui-custom/autocomplete-gender"
import WorkLocationAutocomplete from "@/components/ui-custom/autocomplete-worklocation"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface Props {
  employee?: IEmployeeBasic
  onCancel?: () => void
  onSave?: (data: EmployeeBasicValues) => void
}

export function EmployeeBasicForm({ employee, onCancel, onSave }: Props) {
  // Debug logging
  console.log("Employee data in basic dialog:", employee)

  const form = useForm<EmployeeBasicValues>({
    resolver: zodResolver(employeeBasicSchema),
    defaultValues: {
      employeeId: 0,
      companyId: 0,
      employeeCode: "",
      employeeName: "",
      photo: "",
      departmentId: 0,
      designationId: 0,
      workLocationId: 0,
      genderId: 0,
      joinDate: format(new Date(), clientDateFormat),
      confirmationDate: format(new Date(), clientDateFormat),
      lastDate: format(new Date(), clientDateFormat),
      offPhoneNo: "",
      offEmailAdd: "",
      nationalityId: 0,
      employmentType: "",
      contractType: "",
      remarks: "",
      isActive: true,
    },
  })

  const onSubmit = (data: EmployeeBasicValues) => {
    console.log("🔘 Submit button clicked!")
    console.log("Form data:", data)
    console.log("Form is valid:", form.formState.isValid)
    console.log("Form errors:", form.formState.errors)

    onSave?.(data)
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <CompanyAutocomplete
            form={form}
            label="Company"
            name="companyId"
            isRequired
          />
          <CustomInput
            form={form}
            label="Employee Code"
            name="employeeCode"
            placeholder="Enter employee code"
            isRequired
          />
          <CustomInput
            form={form}
            label="Employee Name"
            name="employeeName"
            placeholder="Enter employee name"
            isRequired
          />
          <EmploymentTypeAutocomplete
            form={form}
            label="Employment Type"
            name="employmentType"
          />

          <DepartmentAutocomplete
            form={form}
            label="Department"
            name="departmentId"
          />

          <DesignationAutocomplete
            form={form}
            label="Designation"
            name="designationId"
          />

          <WorkLocationAutocomplete
            form={form}
            label="Work Location"
            name="workLocationId"
          />
          <GenderAutocomplete form={form} label="Gender" name="genderId" />
          <CustomDateNew form={form} label="Date of Joining" name="joinDate" />
          <CustomDateNew
            form={form}
            label="Date of Confirmation"
            name="confirmationDate"
          />

          <ContractTypeAutocomplete
            form={form}
            label="Contract Type"
            name="contractType"
          />

          <CustomInput
            form={form}
            label="Office Phone Number"
            name="offPhoneNo"
            placeholder="Enter office phone number"
          />

          <CustomInput
            form={form}
            label="Office Email Address"
            name="offEmailAdd"
            placeholder="Enter office email address"
          />

          <CountryAutocomplete
            form={form}
            label="Nationality"
            name="nationalityId"
          />
        </div>

        <CustomTextarea form={form} label="Remarks" name="remarks" />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}
