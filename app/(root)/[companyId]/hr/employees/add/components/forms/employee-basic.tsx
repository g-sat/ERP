"use client"

import { EmployeeBasicValues, employeeBasicSchema } from "@/schemas/employee"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ContractTypeAutocomplete from "@/components/ui-custom/autocomplete-contract-type"
import CountryAutocomplete from "@/components/ui-custom/autocomplete-country"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import DesignationAutocomplete from "@/components/ui-custom/autocomplete-designation"
import EmployerAutocomplete from "@/components/ui-custom/autocomplete-employer"
import EmploymentTypeAutocomplete from "@/components/ui-custom/autocomplete-employment-type"
import GenderAutocomplete from "@/components/ui-custom/autocomplete-gender"
import WorkLocationAutocomplete from "@/components/ui-custom/autocomplete-worklocation"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface Props {
  onCancel?: () => void
  onSave?: (data: EmployeeBasicValues) => void
}

export function EmployeeBasicForm({ onCancel, onSave }: Props) {
  const form = useForm<EmployeeBasicValues>({
    resolver: zodResolver(employeeBasicSchema),
    defaultValues: {
      employeeId: 0,
      employerId: 0,
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
          <EmployerAutocomplete
            form={form}
            label="Company"
            name="employerId"
            isRequired={true}
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
            isRequired
          />

          <DepartmentAutocomplete
            form={form}
            label="Department"
            name="departmentId"
            isRequired
          />

          <DesignationAutocomplete
            form={form}
            label="Designation"
            name="designationId"
            isRequired
          />

          <WorkLocationAutocomplete
            form={form}
            label="Work Location"
            name="workLocationId"
            isRequired
          />
          <GenderAutocomplete
            form={form}
            label="Gender"
            name="genderId"
            isRequired
          />
          <CustomDateNew
            form={form}
            label="Date of Joining"
            name="joinDate"
            isRequired
          />
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
            isRequired
          />

          <CountryAutocomplete
            form={form}
            label="Nationality"
            name="nationalityId"
            isRequired
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
